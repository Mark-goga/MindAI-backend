import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { ReleasesRepository } from './releases.repository';
import { CheckVersionDto, CreateReleaseDto, ListReleasesDto } from './dto';

function compareSemver(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

@Injectable()
export class ReleasesService {
  constructor(private readonly releasesRepository: ReleasesRepository) {}

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
    const updateRequired = compareSemver(dto.version, latest.minVersion) < 0;

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
