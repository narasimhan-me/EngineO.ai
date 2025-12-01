import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let code = 'HTTP_ERROR';

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp.message === 'string') {
          message = resp.message;
        } else if (Array.isArray(resp.message)) {
          message = resp.message.join(', ');
        } else {
          message = exception.message;
        }
        // Preserve custom error code if provided
        if (typeof resp.code === 'string') {
          code = resp.code;
        }
      } else {
        message = exception.message;
      }

      response.status(status).json({
        statusCode: status,
        error: exception.name || 'HttpException',
        message,
        code,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    } else {
      // TODO: Add structured logging with request IDs for better traceability
      console.error('Unhandled error:', exception);

      response.status(500).json({
        statusCode: 500,
        error: 'Internal server error',
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
