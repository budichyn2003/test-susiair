import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? this.getMessage(exception)
        : 'Internal server error';

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getMessage(exception: HttpException): string | string[] {
    const body: unknown = exception.getResponse();

    if (typeof body === 'string') {
      return body;
    }

    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      (typeof body.message === 'string' ||
        (Array.isArray(body.message) &&
          body.message.every((item) => typeof item === 'string')))
    ) {
      return body.message;
    }

    return exception.message;
  }
}
