import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = Number(configService.get<number>('REDIS_PORT', 6379));
        const password =
          configService.get<string>('REDIS_PASSWORD') || undefined;

        return new Redis({
          host,
          port,
          password,
          maxRetriesPerRequest: 3,
          retryStrategy(times: number): number | null {
            if (times > 5) {
              return null;
            }
            return Math.min(times * 500, 2000);
          },
          lazyConnect: true,
        });
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
