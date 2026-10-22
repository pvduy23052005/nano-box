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

export enum HostType {
  HTTP = 'http',
  GRAPHQL = 'graphql',
  WS = 'ws',
}

interface ParsedError {
  statusCode: HttpStatus;
  errorCode: string;
  message: string;
  errors?: Record<string, string> | string[];
  rawResponse?: Record<string, unknown>;
  stack?: string;
}

const DEFAULT_HTTP_ERROR_MESSAGES: Record<string, string> = {
  Unauthorized: 'Phiên làm việc không hợp lệ hoặc đã hết hạn.',
  Forbidden: 'Bạn không có quyền thực hiện hành động này.',
  'Not Found': 'Không tìm thấy tài nguyên yêu cầu.',
  'Bad Request': 'Dữ liệu yêu cầu không hợp lệ.',
};

@Catch()
export class GlobalGraphQLExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(GlobalGraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof GraphQLError) {
      return exception;
    }

    const hostType = host.getType<HostType>();
    const parsed = this.parseException(exception);

    if (parsed.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const prefix = hostType === HostType.HTTP ? 'HTTP' : 'GraphQL';
      this.logger.error(
        `[${prefix} ${parsed.statusCode}] ${parsed.message}`,
        parsed.stack,
      );
    }

    if (hostType === HostType.HTTP) {
      return this.sendHttpResponse(host, parsed);
    }

    return this.sendGraphQLError(parsed);
  }

  private parseException(exception: unknown): ParsedError {
    if (exception instanceof DomainValidationException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'BAD_USER_INPUT',
        message: exception.message,
        errors: exception.errors,
      };
    }

    if (
      Array.isArray(exception) &&
      exception.length > 0 &&
      exception[0] instanceof ValidationError
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'BAD_USER_INPUT',
        message: 'Dữ liệu đầu vào không hợp lệ.',
        errors: this.flattenValidationErrors(exception as ValidationError[]),
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const resObj =
        typeof res === 'object' && res !== null
          ? (res as Record<string, unknown>)
          : {};

      const rawMsg =
        resObj.message ?? (typeof res === 'string' ? res : exception.message);

      let message = 'Dữ liệu đầu vào không hợp lệ.';
      let errors: Record<string, string> | string[] | undefined;

      if (typeof rawMsg === 'string') {
        message = this.localizeHttpErrorMessage(rawMsg);
      } else if (Array.isArray(rawMsg)) {
        errors = rawMsg as string[];
      } else {
        message = this.localizeHttpErrorMessage(exception.message);
      }

      return {
        statusCode,
        errorCode: this.mapHttpStatusToErrorCode(statusCode),
        message,
        errors,
        rawResponse: resObj,
        stack: exception.stack,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Hệ thống gặp sự cố. Vui lòng thử lại sau.',
        stack: exception.stack,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Hệ thống gặp sự cố. Vui lòng thử lại sau.',
    };
  }

  private sendHttpResponse(host: ArgumentsHost, parsed: ParsedError) {
    const response = host.switchToHttp().getResponse<Response>();
    const body: Record<string, unknown> = {
      ...parsed.rawResponse,
      statusCode: parsed.statusCode,
      message: parsed.message,
    };

    if (parsed.errors) {
      body.errors = parsed.errors;
    }

    return response.status(parsed.statusCode).json(body);
  }

  private sendGraphQLError(parsed: ParsedError) {
    return new GraphQLError(parsed.message, {
      extensions: {
        statusCode: parsed.statusCode,
        code: parsed.errorCode,
        ...(parsed.errors && { errors: parsed.errors }),
      },
    });
  }

  private localizeHttpErrorMessage(rawMessage: string): string {
    const key = Object.keys(DEFAULT_HTTP_ERROR_MESSAGES).find(
      (k) => k.toLowerCase() === rawMessage?.trim().toLowerCase(),
    );
    return key ? DEFAULT_HTTP_ERROR_MESSAGES[key] : rawMessage;
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
}
