import { Module } from '@nestjs/common';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { ReleasesRepository } from './releases.repository';

@Module({
  controllers: [ReleasesController],
  providers: [ReleasesService, ReleasesRepository],
})
export class ReleasesModule {}
