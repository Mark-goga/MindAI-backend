import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';
import { CONFIG } from '@common/constants';

@Injectable()
export class StorageService {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
        secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: CONFIG.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${CONFIG.R2_PUBLIC_URL}/${key}`;
  }

  async uploadStream(
    key: string,
    stream: Readable,
    contentType: string,
    contentLength: number,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: CONFIG.R2_BUCKET_NAME,
        Key: key,
        Body: stream,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
    );

    return `${CONFIG.R2_PUBLIC_URL}/${key}`;
  }

  async uploadFile(
    key: string,
    filepath: string,
    contentType: string,
    contentLength: number,
  ): Promise<string> {
    return this.uploadStream(
      key,
      createReadStream(filepath),
      contentType,
      contentLength,
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: CONFIG.R2_BUCKET_NAME,
        Key: key,
      }),
    );
  }

  buildBinaryKey(appId: string, version: string, filename: string): string {
    const safeName = filename.replace(/[^a-zA-Z0-9._\-]/g, '_');
    return `${appId}/${version}/${safeName}`;
  }
}
