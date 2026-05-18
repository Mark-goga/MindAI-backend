import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
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
  async checkVersion(@Query() dto: CheckVersionDto) {
    const response = await this.releasesService.checkVersion(dto);
    console.log({response});
    return response
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

  @Get(ENDPOINTS.RELEASES.APPCAST.ENDPOINT)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation(ENDPOINTS.RELEASES.APPCAST.DOCKS)
  async appcast(
    @Query('appId') appId: string,
    @Query('platform') platform: string,
    @Res() res: FastifyReply,
  ) {
    const xml = await this.releasesService.generateAppcast(appId, platform);
    res.send(xml);
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
