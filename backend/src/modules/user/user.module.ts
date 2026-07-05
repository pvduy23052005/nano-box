import { Module } from '@nestjs/common';
import { UserResolver } from './presentation/graphql/user.resolver';

@Module({
  providers: [UserResolver],
})
export class UserModule {}
