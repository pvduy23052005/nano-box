import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nano-box',
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 2,
    };
  }
}