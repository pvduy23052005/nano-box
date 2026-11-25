import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserModule } from '../user/user.module';
import { NotificationClientAdapter } from './applications/ports/notification-client.port';
import { GrpcNotificationAdapter } from './infrastructure/externals/grpc-notification.adapter';
import { NotificationListener } from './presentation/listener/notification.listener';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_GRPC_PACKAGE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const protoPath =
            [
              join(__dirname, '../../../proto/notification.proto'),
              join(__dirname, '../../proto/notification.proto'),
              join(process.cwd(), 'dist/proto/notification.proto'),
              join(process.cwd(), 'src/proto/notification.proto'),
              join(process.cwd(), '../proto/notification.proto'),
            ].find((candidate) => existsSync(candidate)) ||
            join(__dirname, '../../../proto/notification.proto');

          return {
            transport: Transport.GRPC,
            options: {
              package: 'notification',
              protoPath,
              url: configService.get<string>(
                'NOTIFICATION_GRPC_URL',
                'localhost:50053',
              ),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    UserModule,
  ],
  providers: [
    NotificationListener,
    {
      provide: NotificationClientAdapter,
      useClass: GrpcNotificationAdapter,
    },
  ],
  exports: [NotificationClientAdapter],
})
export class NotificationModule {}
