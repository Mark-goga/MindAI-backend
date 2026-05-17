import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { FastifyReply } from 'fastify';

interface PostgresError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
  column?: string;
}

@Catch()
export class DrizzleFilter implements ExceptionFilter {
  private readonly logger = new PinoLogger({
    renameContext: 'GlobalDatabaseFilter',
  });

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .send(exception.getResponse());
    }

    const dbError = ((exception as any).cause || exception) as PostgresError;
    const errorCode = dbError.code;

    if (errorCode) {
      switch (errorCode) {
        case '23505':
          return this.sendResponse(
            response,
            HttpStatus.CONFLICT,
            'A record with these unique details already exists.',
            {
              detail: dbError.detail,
              table: dbError.table,
            },
          );

        case '23503':
          return this.sendResponse(
            response,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Cannot complete the action due to a foreign key constraint violation.',
            {
              detail: dbError.detail,
              table: dbError.table,
            },
          );

        case '23502':
          return this.sendResponse(
            response,
            HttpStatus.BAD_REQUEST,
            'Missing required database field.',
            {
              column: dbError.column,
              table: dbError.table,
            },
          );

        case '22P02':
          return this.sendResponse(
            response,
            HttpStatus.BAD_REQUEST,
            'Invalid data format provided for the database.',
            {
              message: dbError.message,
            },
          );
      }
    }

    this.logger.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private sendResponse(
    response: FastifyReply,
    status: HttpStatus,
    message: string,
    meta?: Record<string, any>,
  ) {
    this.logger.warn({ meta }, `Database Error [${status}]: ${message}`);

    const cleanMeta = meta
      ? Object.fromEntries(
          Object.entries(meta).filter(([_, value]) => value !== undefined),
        )
      : undefined;

    return response.status(status).send({
      statusCode: status,
      message,
      error: HttpStatus[status],
      ...(cleanMeta &&
        Object.keys(cleanMeta).length > 0 && { meta: cleanMeta }),
    });
  }
}
