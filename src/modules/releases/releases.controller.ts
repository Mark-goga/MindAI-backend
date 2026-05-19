import '@fastify/multipart';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  PayloadTooLargeException,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ENDPOINTS, ERROR_MESSAGES } from '@common/constants';
import { AccessTokenGuard, AdminGuard } from '@common/guards';
import {
  CheckVersionDto,
  CreateReleaseDto,
  ListReleasesDto,
  UploadBinaryDto,
} from './dto';
import { ReleasesService } from './releases.service';

@Controller(ENDPOINTS.RELEASES.BASE)
@ApiTags(ENDPOINTS.RELEASES.BASE)
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get(ENDPOINTS.RELEASES.CHECK.ENDPOINT)
  @ApiOperation(ENDPOINTS.RELEASES.CHECK.DOCKS)
  async checkVersion(@Query() dto: CheckVersionDto) {
    return await this.releasesService.checkVersion(dto);
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

  @Post(ENDPOINTS.RELEASES.UPLOAD_BINARY.ENDPOINT)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.RELEASES.UPLOAD_BINARY.DOCKS)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(AccessTokenGuard, AdminGuard)
  async uploadBinary(
    @Query() dto: UploadBinaryDto,
    @Req() req: FastifyRequest,
  ) {
    let data;

    try {
      data = await req.file();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'FST_REQ_FILE_TOO_LARGE'
      ) {
        throw new PayloadTooLargeException(ERROR_MESSAGES.STORAGE.FILE_TOO_LARGE);
      }

      throw error;
    }

    if (!data) {
      throw new BadRequestException(ERROR_MESSAGES.STORAGE.FILE_REQUIRED);
    }

    return this.releasesService.uploadBinary(dto, data);
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
