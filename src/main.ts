import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CONFIG } from '@common/constants';
import { Logger } from 'nestjs-pino';
import { SwaggerModule } from '@nestjs/swagger';
import { GlobalInterceptor } from '@common/interceptors';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ZodValidationPipe } from 'nestjs-zod';
import { createSwaggerDocument } from '@common/swagger/swagger.util';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  await app.register(fastifyCookie as any);
  await app.register(helmet as any);
  await app.register(cors as any, {
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });
  await app.register(multipart as any);

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalInterceptors(new GlobalInterceptor());

  const document = createSwaggerDocument(app);
  SwaggerModule.setup('api', app, document);

  await app.listen(CONFIG.PORT, '0.0.0.0');
}

bootstrap();
