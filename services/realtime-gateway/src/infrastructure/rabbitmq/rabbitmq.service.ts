import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import {
  DEFAULT_PREFETCH_COUNT,
  RABBITMQ_TOPOLOGY,
} from '../configs/rabbitmq.config';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection!: AmqpConnectionManager;
  private setupChannel!: ChannelWrapper;
  private readonly consumerChannels: ChannelWrapper[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.getOrThrow<string>('rabbitmq.url');

    this.connection = amqp.connect([url]);

    this.connection.on('connect', () => {
      this.logger.log('RabbitMQ connected successfully');
    });

    this.connection.on('disconnect', ({ err }) => {
      this.logger.warn(`RabbitMQ disconnected: ${err?.message ?? 'unknown'}`);
    });

    this.setupChannel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await this.setupTopology(channel);
      },
    });

    await this.setupChannel.waitForConnect();
  }

  isConnected(): boolean {
    return Boolean(this.connection?.isConnected());
  }

  private async setupTopology(channel: ConfirmChannel): Promise<void> {
    const { EXCHANGES } = RABBITMQ_TOPOLOGY;

    await channel.assertExchange(EXCHANGES.NOTIFICATION_REALTIME, 'fanout', {
      durable: true,
    });
    await channel.assertExchange(EXCHANGES.REALTIME_EVENTS, 'fanout', {
      durable: true,
    });
  }

  async subscribeFanout<T>(
    exchange: string,
    handler: (data: T, rawMessage: ConsumeMessage) => Promise<void>,
    prefetchCount?: number,
  ): Promise<void> {
    const configuredPrefetch = this.configService.get<number>(
      'rabbitmq.prefetchCount',
      DEFAULT_PREFETCH_COUNT,
    );
    const prefetch =
      prefetchCount !== undefined &&
      Number.isInteger(prefetchCount) &&
      prefetchCount > 0
        ? prefetchCount
        : configuredPrefetch;

    const consumerChannel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        await channel.prefetch(prefetch);
        const { queue } = await channel.assertQueue('', {
          exclusive: true,
          autoDelete: true,
        });
        await channel.bindQueue(queue, exchange, '');
        await channel.consume(
          queue,
          (msg) => {
            if (!msg) return;
            void this.handleIncomingMessage(channel, msg, handler);
          },
          { noAck: false },
        );
      },
    });

    this.consumerChannels.push(consumerChannel);
    await consumerChannel.waitForConnect();
  }

  private async handleIncomingMessage<T>(
    channel: ConfirmChannel,
    msg: ConsumeMessage,
    handler: (data: T, rawMessage: ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    try {
      const parsed = JSON.parse(msg.content.toString('utf8')) as T;
      await handler(parsed, msg);
    } catch (error) {
      this.logger.error(
        `Failed to process RabbitMQ message ${msg.properties.messageId ?? ''}`,
        error,
      );
      try {
        channel.nack(msg, false, false);
      } catch (nackError) {
        this.logger.warn(
          `Failed to nack RabbitMQ message ${msg.properties.messageId ?? ''}`,
          nackError,
        );
      }
      return;
    }

    try {
      channel.ack(msg);
    } catch (ackError) {
      this.logger.warn(
        `Failed to ack RabbitMQ message ${msg.properties.messageId ?? ''}`,
        ackError,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled(
      this.consumerChannels.map(async (ch) => {
        try {
          await ch.close();
        } catch (error) {
          this.logger.warn('Error closing RabbitMQ consumer channel', error);
        }
      }),
    );

    try {
      await this.setupChannel?.close();
    } catch (error) {
      this.logger.warn('Error closing RabbitMQ setup channel', error);
    }

    try {
      await this.connection?.close();
      this.logger.log('RabbitMQ connection closed gracefully');
    } catch (error) {
      this.logger.warn('Error closing RabbitMQ connection', error);
    }
  }
}
