import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { createWriteStream } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { ERROR_MESSAGES } from '@common/constants';
import { StorageService } from '@common/storage/storage.service';
import { ReleasesRepository } from './releases.repository';
import {
  CheckVersionDto,
  CreateReleaseDto,
  ListReleasesDto,
  UploadBinaryDto,
} from './dto';

const ALLOWED_EXTENSIONS = [
  '.exe',
  '.app',
  '.dmg',
  '.zip',
  '.AppImage',
  '.deb',
  '.rpm',
];

function getMimeType(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const map: Record<string, string> = {
    '.exe': 'application/vnd.microsoft.portable-executable',
    '.app': 'application/octet-stream',
    '.dmg': 'application/x-apple-diskimage',
    '.zip': 'application/zip',
    '.AppImage': 'application/octet-stream',
    '.deb': 'application/vnd.debian.binary-package',
    '.rpm': 'application/x-rpm',
  };
  return map[ext] ?? 'application/octet-stream';
}

function compareSemver(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

@Injectable()
export class ReleasesService {
  constructor(
    private readonly releasesRepository: ReleasesRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadBinary(
    dto: UploadBinaryDto,
    file: MultipartFile,
  ): Promise<{ url: string; key: string }> {
    const { filename } = file;
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(ERROR_MESSAGES.STORAGE.INVALID_FILE_TYPE);
    }

    const key = this.storageService.buildBinaryKey(
      dto.appId,
      dto.version,
      filename,
    );

    const contentType = getMimeType(filename);
    const tempDir = await mkdtemp(join(tmpdir(), 'release-upload-'));
    const tempPath = join(tempDir, filename.replace(/[/\\]/g, '_'));

    try {
      await pipeline(file.file, createWriteStream(tempPath));

      if (file.file.truncated) {
        throw new PayloadTooLargeException(
          ERROR_MESSAGES.STORAGE.FILE_TOO_LARGE,
        );
      }

      const { size } = await stat(tempPath);

      const url = await this.storageService.uploadFile(
        key,
        tempPath,
        contentType,
        size,
      );

      return { url, key };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'FST_REQ_FILE_TOO_LARGE'
      ) {
        await this.storageService.delete(key).catch(() => undefined);
        throw new PayloadTooLargeException(
          ERROR_MESSAGES.STORAGE.FILE_TOO_LARGE,
        );
      }

      throw error;
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(
        () => undefined,
      );
    }
  }

  async create(dto: CreateReleaseDto) {
    return await this.releasesRepository.create(dto);
  }

  async list(dto: ListReleasesDto) {
    return this.releasesRepository.list(dto.appId, dto.platform);
  }

  async delete(id: string) {
    const deleted = await this.releasesRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundException(ERROR_MESSAGES.RELEASES.NOT_FOUND);
    }

    return { deleted: true };
  }

  async generateAppcast(appId: string, platform: string): Promise<string> {
    const all = await this.releasesRepository.list(appId, platform as never);
    const released = all.filter(r => r.isReleased && r.downloadUrl);

    const items = released
      .map(
        r => `
    <item>
      <title>Version ${r.version}</title>
      <sparkle:version>${r.version}</sparkle:version>
      <sparkle:shortVersionString>${r.version}</sparkle:shortVersionString>
      <enclosure
        url="${r.downloadUrl}"
        sparkle:version="${r.version}"
        length="0"
        type="application/octet-stream"
      />
    </item>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle">
  <channel>
    <title>${appId} Updates</title>
    <link>${appId}</link>
    <language>en</language>${items}
  </channel>
</rss>`;
  }

  async checkVersion(dto: CheckVersionDto) {
    const latest = await this.releasesRepository.findLatest(
      dto.appId,
      dto.platform,
    );

    if (!latest) {
      return {
        updateAvailable: false,
        updateRequired: false,
        latestVersion: dto.version,
        downloadUrl: null,
        storeUrl: null,
        releaseNotes: null,
      };
    }

    const updateAvailable = compareSemver(dto.version, latest.version) < 0;
    const updateRequired =
      compareSemver(dto.version, latest.minVersion) < 0 || latest.isMandatory;

    return {
      updateAvailable,
      updateRequired,
      latestVersion: latest.version,
      downloadUrl: latest.downloadUrl ?? null,
      storeUrl: latest.storeUrl ?? null,
      releaseNotes: latest.releaseNotes ?? null,
    };
  }
}
