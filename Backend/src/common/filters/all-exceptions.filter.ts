import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error
    this.logger.error(
      `HTTP Status: ${status} Error: ${JSON.stringify(exceptionResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Prompt 2.1: If the response is already a structured object with success and error, pass it through
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      (exceptionResponse as any).success !== undefined
    ) {
      const respObj = exceptionResponse as any;
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...respObj,
      });
    }

    // Standard fallback wrapping
    const displayMessage =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
        : exceptionResponse;

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: displayMessage,
    });
  }
}
