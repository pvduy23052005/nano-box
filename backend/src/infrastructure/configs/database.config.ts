import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  private readonly logger = new Logger('MongoDB');

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nano-box',
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 2,

      connectionFactory: (connection: Connection) => {
        if (Number(connection.readyState) === 1) {
          this.logger.log('MongoDB connected successfully');
        }

        connection.on('error', (err) => {
          this.logger.error(`MongoDB connection error`, err);
        });

        connection.on('disconnected', () => {
          this.logger.warn('MongoDB disconnected');
        });

        return connection;
      },
    };
  }
}
