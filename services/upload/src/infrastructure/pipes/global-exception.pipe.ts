import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import type { Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { MAX_FILE_SIZE } from '../../domain/upload.constant';
import { DomainValidationException } from '../../domain/domain-validation.exception';

interface ParsedError {
  statusCode: number;
  message: string;
  errors?: Record<string, string> | string[];
  type: 'DOMAIN_VALIDATION_ERROR' | 'HTTP_CLIENT_ERROR';
  logMessage: string;
  stack?: string;
}

interface RequestWithUser {
  method?: string;
  url?: string;
  user?: { id?: string };
}

const INTERNAL_MSG = 'Hệ thống gặp sự cố. Vui lòng thử lại sau.';
const MAX_MB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Phiên làm việc không hợp lệ hoặc đã hết hạn.',
  forbidden: 'Bạn không có quyền thực hiện hành động này.',
  'not found': 'Không tìm thấy tài nguyên yêu cầu.',
  'bad request': 'Dữ liệu yêu cầu không hợp lệ.',
  'file too large': `Kích thước file vượt quá giới hạn tối đa ${MAX_MB}MB.`,
};

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Response | Observable<never> {
    if (host.getType() !== 'http') {
      const err = exception instanceof Error ? exception : undefined;
      this.logger.error(
        `[RPC Exception] ${err?.message ?? String(exception)}`,
        err?.stack,
      );
      const rpcError =
        exception instanceof RpcException
          ? exception.getError()
          : { code: GrpcStatus.INTERNAL, message: 'Internal server error' };
      return throwError(() => rpcError);
    }

    const parsed = this.parseException(exception);
    const req = host.switchToHttp().getRequest<RequestWithUser>();
    const res = host.switchToHttp().getResponse<Response>();

    if (parsed.statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `[HTTP ${parsed.statusCode}] ${parsed.logMessage}`,
        parsed.stack,
      );
    } else if (
      parsed.statusCode === Number(HttpStatus.BAD_REQUEST) ||
      parsed.statusCode === Number(HttpStatus.PAYLOAD_TOO_LARGE)
    ) {
      const path = (req?.url ?? '').split('?')[0];
      const operation = `${req?.method ?? 'UNKNOWN'} ${path}`.trim();
      this.logger.warn(
        {
          type: parsed.type,
          statusCode: parsed.statusCode,
          operation,
          ...(req?.user?.id ? { userId: req.user.id } : {}),
          ...(parsed.errors ? { errors: parsed.errors } : {}),
        },
        `[Validation Warning] ${operation} -> ${parsed.message}`,
      );
    }

    if (res.headersSent) {
      return res;
    }

    return res.status(parsed.statusCode).json({
      statusCode: parsed.statusCode,
      message: parsed.message,
      ...(parsed.errors ? { errors: parsed.errors } : {}),
    });
  }

  private parseException(exception: unknown): ParsedError {
    if (exception instanceof DomainValidationException) {
      const message =
        Object.values(exception.errors).find(Boolean) ?? exception.message;
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors: exception.errors,
        type: 'DOMAIN_VALIDATION_ERROR',
        logMessage: message,
      };
    }

    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      const errors: Record<string, string> = {};
      for (const err of exception as ValidationError[]) {
        const msg = err.constraints && Object.values(err.constraints)[0];
        if (msg) {
          errors[err.property] = msg;
        }
      }
      const message =
        Object.values(errors)[0] ?? 'Dữ liệu đầu vào không hợp lệ.';
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
        type: 'DOMAIN_VALIDATION_ERROR',
        logMessage: message,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      const rawMsg =
        typeof raw === 'object' && raw !== null && 'message' in raw
          ? (raw as { message?: unknown }).message
          : typeof raw === 'string'
            ? raw
            : exception.message;
      const isServer = statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR);
      const errors =
        !isServer && Array.isArray(rawMsg) ? (rawMsg as string[]) : undefined;
      const rawText =
        typeof rawMsg === 'string'
          ? rawMsg
          : (errors?.[0] ?? exception.message);
      const message = isServer
        ? INTERNAL_MSG
        : (ERROR_MESSAGES[rawText.trim().toLowerCase()] ?? rawText);

      return {
        statusCode,
        message,
        errors,
        type: 'HTTP_CLIENT_ERROR',
        logMessage: exception.message,
        stack: exception.stack,
      };
    }

    const err = exception instanceof Error ? exception : undefined;
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: INTERNAL_MSG,
      type: 'HTTP_CLIENT_ERROR',
      logMessage: err?.message ?? String(exception),
      stack: err?.stack,
    };
  }
}
