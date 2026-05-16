import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('template-nest')
    .addBearerAuth()
    .setDescription('template-nest')
    .setVersion('1.0')
    .build();
}

export function createSwaggerDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, createSwaggerConfig());
}
