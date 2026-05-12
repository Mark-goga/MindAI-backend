import { Injectable } from '@nestjs/common';
import { HealthStatusDto } from '@modules/health/dto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
) as { version?: string };

@Injectable()
export class HealthService {
  status(data: HealthStatusDto) {
    return {
      status: 'all work',
      version: packageJson.version,
      data,
    };
  }
}
