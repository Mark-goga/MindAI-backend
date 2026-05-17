import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS } from '@common/constants';
import { AccessTokenGuard, AdminGuard } from '@common/guards';
import { CheckVersionDto, CreateReleaseDto, ListReleasesDto } from './dto';
import { ReleasesService } from './releases.service';

@Controller(ENDPOINTS.RELEASES.BASE)
@ApiTags(ENDPOINTS.RELEASES.BASE)
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get(ENDPOINTS.RELEASES.CHECK.ENDPOINT)
  @ApiOperation(ENDPOINTS.RELEASES.CHECK.DOCKS)
  checkVersion(@Query() dto: CheckVersionDto) {
    return this.releasesService.checkVersion(dto);
  }

  @Post(ENDPOINTS.RELEASES.CREATE.ENDPOINT)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.RELEASES.CREATE.DOCKS)
  @UseGuards(AccessTokenGuard, AdminGuard)
  create(@Body() dto: CreateReleaseDto) {
    return this.releasesService.create(dto);
  }

  @Get(ENDPOINTS.RELEASES.LIST.ENDPOINT)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.RELEASES.LIST.DOCKS)
  @UseGuards(AccessTokenGuard, AdminGuard)
  list(@Query() dto: ListReleasesDto) {
    return this.releasesService.list(dto);
  }

  @Delete(ENDPOINTS.RELEASES.DELETE.ENDPOINT)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.RELEASES.DELETE.DOCKS)
  @UseGuards(AccessTokenGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.releasesService.delete(id);
  }
}
