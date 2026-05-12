import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { TestingModule } from '@nestjs/testing';
import { NestApplication } from '@nestjs/core';

export const createNestApp = (
  module: TestingModule,
  nameController: string,
) => {
  const app = module.createNestApplication<NestApplication>();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());

  const logger = new Logger(nameController);
  app.useLogger(logger);

  return app;
};
