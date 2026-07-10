import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IBasePayload<T> {
  success: boolean;
  message: string;
  data?: T | null;
}

export function BasePayload<T>(ItemType: Type<T>): Type<IBasePayload<T>> {
  @ObjectType({ isAbstract: true })
  abstract class BasePayloadClass implements IBasePayload<T> {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String)
    message: string;

    @Field(() => ItemType, { nullable: true })
    data?: T | null;
  }

  return BasePayloadClass as Type<IBasePayload<T>>;
}
