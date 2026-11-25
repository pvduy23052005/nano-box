import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  private readonly logger = new Logger(MongooseConfig.name);

  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri =
      this.configService.get<string>('MONGO_URI') ||
      'mongodb://notification-db:27017/nano-box-notification';

    return {
      uri,
      onConnectionCreate: (connection) => {
        connection.on('connected', () => {
          this.logger.log('Notification MongoDB connected successfully');
        });
        connection.on('error', (error: Error) => {
          this.logger.error(
            `Notification MongoDB connection error: ${error.message}`,
          );
        });
        return connection;
      },
    };
  }
}
