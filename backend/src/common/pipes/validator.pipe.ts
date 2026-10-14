import {
  Catch,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { GraphQLError } from 'graphql';
import { ValidationError } from 'class-validator';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { DomainValidationException } from '../customs/domain-validation.exception';

@Catch()
export class GlobalGraphQLExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(GlobalGraphQLExceptionFilter.name);

  private static readonly DEFAULT_HTTP_ERROR_MESSAGES: Record<string, string> = {
    Unauthorized: 'Phiên làm việc không hợp lệ hoặc đã hết hạn.',
    Forbidden: 'Bạn không có quyền thực hiện hành động này.',
    'Not Found': 'Không tìm thấy tài nguyên yêu cầu.',
    'Bad Request': 'Dữ liệu yêu cầu không hợp lệ.',
  };

  private localizeHttpErrorMessage(rawMessage: string): string {
    const key = Object.keys(
      GlobalGraphQLExceptionFilter.DEFAULT_HTTP_ERROR_MESSAGES,
    ).find((k) => k.toLowerCase() === rawMessage?.trim().toLowerCase());
    return key
      ? GlobalGraphQLExceptionFilter.DEFAULT_HTTP_ERROR_MESSAGES[key]
      : rawMessage;
  }

  private mapHttpStatusToErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_USER_INPUT';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHENTICATED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'INTERNAL_SERVER_ERROR'
          : 'BAD_REQUEST';
    }
  }

  private flattenValidationErrors(
    validationErrors: ValidationError[],
    parentPath = '',
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const err of validationErrors) {
      const propertyPath = parentPath
        ? `${parentPath}.${err.property}`
        : err.property;

      if (err.constraints) {
        const firstKey = Object.keys(err.constraints)[0];
        if (firstKey) {
          result[propertyPath] = err.constraints[firstKey];
        }
      }

      if (err.children && err.children.length > 0) {
        Object.assign(
          result,
          this.flattenValidationErrors(err.children, propertyPath),
        );
      }
    }

    return result;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const hostType = host.getType<'http' | 'graphql' | 'ws'>();

    if (hostType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let responseBody: Record<string, unknown> = {
        statusCode,
        message: 'Hệ thống gặp sự cố. Vui lòng thử lại sau.',
      };

      if (exception instanceof DomainValidationException) {
        statusCode = HttpStatus.BAD_REQUEST;
        responseBody = {
          statusCode,
          message: exception.message,
          errors: exception.errors,
        };
      } else if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        const res = exception.getResponse();

        if (typeof res === 'string') {
          responseBody = {
            statusCode,
            message: this.localizeHttpErrorMessage(res),
          };
        } else if (res && typeof res === 'object') {
          const resObj = res as Record<string, unknown>;
          const rawMsg = resObj.message;

          responseBody = {
            ...resObj,
            statusCode,
            message:
              typeof rawMsg === 'string'
                ? this.localizeHttpErrorMessage(rawMsg)
                : Array.isArray(rawMsg)
                  ? rawMsg
                  : this.localizeHttpErrorMessage(exception.message),
          };
        }
      } else if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error('Unhandled HTTP exception', exception);
      }

      return response.status(statusCode).json(responseBody);
    }

    if (exception instanceof GraphQLError) {
      return exception;
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Hệ thống gặp sự cố. Vui lòng thử lại sau.';
    let formattedErrors: Record<string, string> | string[] | string | undefined =
      undefined;

    if (exception instanceof DomainValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_USER_INPUT';
      message = exception.message;
      formattedErrors = exception.errors;
    } else if (
      Array.isArray(exception) &&
      exception.length > 0 &&
      exception[0] instanceof ValidationError
    ) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_USER_INPUT';
      message = 'Dữ liệu đầu vào không hợp lệ.';
      formattedErrors = this.flattenValidationErrors(
        exception as ValidationError[],
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = this.mapHttpStatusToErrorCode(statusCode);
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = this.localizeHttpErrorMessage(res);
      } else if (res && typeof res === 'object') {
        const resObj = res as Record<string, unknown>;
        if (typeof resObj.message === 'string') {
          message = this.localizeHttpErrorMessage(resObj.message);
        } else if (Array.isArray(resObj.message)) {
          message = 'Dữ liệu đầu vào không hợp lệ.';
          formattedErrors = resObj.message as string[];
        } else {
          message = this.localizeHttpErrorMessage(exception.message);
        }
      } else {
        message = this.localizeHttpErrorMessage(exception.message);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Unhandled GraphQL exception', exception);
    }

    return new GraphQLError(message, {
      extensions: {
        statusCode,
        code: errorCode,
        ...(formattedErrors !== undefined && { errors: formattedErrors }),
      },
    });
  }
}
