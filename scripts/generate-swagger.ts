import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { dump } from 'js-yaml';
import { AppModule } from '../src/app.module';
import { createSwaggerDocument } from '../src/common/swagger/swagger.util';

async function generateSwagger() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });

  try {
    await app.init();

    const document = createSwaggerDocument(app);

    await writeFile(resolve(process.cwd(), 'swagger.json'), JSON.stringify(document, null, 2) + '\n');
    await writeFile(
      resolve(process.cwd(), 'swagger.yaml'),
      dump(document, {
        skipInvalid: true,
        noRefs: true,
      }),
    );
  } finally {
    await app.close();
  }
}

generateSwagger().catch((error: unknown) => {
  console.error('Failed to generate Swagger files.', error);
  process.exit(1);
});
