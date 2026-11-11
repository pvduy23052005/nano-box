import { ObjectType } from '@nestjs/graphql';
import { BasePayload } from 'src/common/customs/base.payload';
import { UserProfilePayload } from './profile.payload';

@ObjectType()
export class UpdateProfilePayload extends BasePayload(UserProfilePayload) {}
