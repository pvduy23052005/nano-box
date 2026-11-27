import { randomUUID } from 'node:crypto';
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
import { RABBITMQ_TOPOLOGY } from '../configs/rabbitmq.config';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection!: AmqpConnectionManager;
  private publishChannel!: ChannelWrapper;
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

    this.publishChannel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await this.setupTopology(channel);
      },
    });

    await this.publishChannel.waitForConnect();
  }

  private async setupTopology(channel: ConfirmChannel): Promise<void> {
    const { EXCHANGES, QUEUES, ROUTING_KEYS } = RABBITMQ_TOPOLOGY;

    await channel.assertExchange(EXCHANGES.NOTIFICATION_DLX, 'direct', {
      durable: true,
    });
    await channel.assertQueue(QUEUES.NOTIFICATION_DLQ, {
      durable: true,
    });
    await channel.bindQueue(
      QUEUES.NOTIFICATION_DLQ,
      EXCHANGES.NOTIFICATION_DLX,
      ROUTING_KEYS.NOTIFICATION_DEAD,
    );

    await channel.assertExchange(EXCHANGES.NOTIFICATION_EVENTS, 'topic', {
      durable: true,
    });
    await channel.assertQueue(QUEUES.NOTIFICATION_CREATE, {
      durable: true,
      deadLetterExchange: EXCHANGES.NOTIFICATION_DLX,
      deadLetterRoutingKey: ROUTING_KEYS.NOTIFICATION_DEAD,
    });
    await channel.bindQueue(
      QUEUES.NOTIFICATION_CREATE,
      EXCHANGES.NOTIFICATION_EVENTS,
      ROUTING_KEYS.NOTIFICATION_ALL,
    );

    await channel.assertExchange(EXCHANGES.NOTIFICATION_REALTIME, 'fanout', {
      durable: true,
    });
  }

  async publish<T>(
    exchange: string,
    routingKey: string,
    payload: T,
  ): Promise<void> {
    const buffer = Buffer.from(JSON.stringify(payload));
    await this.publishChannel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
      messageId: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
    });
  }

  async consume<T>(
    queue: string,
    handler: (data: T, rawMessage: ConsumeMessage) => Promise<void>,
    prefetchCount?: number,
  ): Promise<void> {
    const prefetch =
      prefetchCount ??
      this.configService.get<number>('rabbitmq.prefetchCount', 10);

    const consumerChannel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.prefetch(prefetch);
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

  async subscribeFanout<T>(
    exchange: string,
    handler: (data: T, rawMessage: ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    const consumerChannel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
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
      channel.ack(msg);
    } catch (error) {
      this.logger.error(
        `Failed to process RabbitMQ message ${msg.properties.messageId ?? ''}`,
        error,
      );
      channel.nack(msg, false, false);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await Promise.all(this.consumerChannels.map((ch) => ch.close()));
      await this.publishChannel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ connection closed gracefully');
    } catch (error) {
      this.logger.warn('Error closing RabbitMQ connection', error);
    }
  }
}
