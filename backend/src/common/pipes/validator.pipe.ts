import { GraphQLError } from 'graphql';
import { ValidationError } from 'class-validator';
import { GqlExceptionFilter } from '@nestjs/graphql';
import {
  Catch,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainValidationException } from '../customs/domain-validation.exception';

@Catch()
export class GlobalGraphQLExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<'http' | 'graphql'>() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: any = 'Hệ thống gặp sự cố. Vui lòng thử lại sau.';

      if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        message = exception.getResponse();
      } else if (exception instanceof Error) {
        console.error(exception);
        message = exception.message;
      }

      return response.status(statusCode).json(
        typeof message === 'object'
          ? message
          : { statusCode, message },
      );
    }
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Hệ thống gặp sự cố. Vui lòng thử lại sau.';
    let formattedErrors: Record<string, string> | string | undefined =
      undefined;

    if (exception instanceof DomainValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_USER_INPUT';
      message = exception.message;
      formattedErrors = exception.errors;
    } else if (
      Array.isArray(exception) &&
      exception[0] instanceof ValidationError
    ) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_USER_INPUT';
      message = 'Dữ liệu đầu vào không hợp lệ.';
      formattedErrors = {};

      exception.forEach((err: ValidationError) => {
        if (err.constraints) {
          const firstKey = Object.keys(err.constraints)[0];
          formattedErrors![err.property] = err.constraints[firstKey];
        }
      });
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode =
        statusCode === HttpStatus.UNAUTHORIZED
          ? 'UNAUTHENTICATED'
          : 'FORBIDDEN';
      message = exception.message;
    } else if (exception instanceof Error) {
      console.error(exception);
    }

    return new GraphQLError(message, {
      extensions: {
        statusCode,
        code: errorCode,
        errors: formattedErrors,
      },
    });
  }
}
