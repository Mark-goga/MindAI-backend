import { Catch, ExceptionFilter } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { DrizzleError } from 'drizzle-orm';

@Catch(DrizzleError)
export class DrizzleFilter implements ExceptionFilter {
  private readonly logger = new PinoLogger({
    renameContext: 'DrizzleExceptionFilter',
  });

  catch(exception: DrizzleError) {
    this.logger.error(exception);

    throw exception;
  }
}
