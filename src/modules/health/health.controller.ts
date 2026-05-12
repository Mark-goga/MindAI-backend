import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { HealthService } from './health.service';
import { ENDPOINTS } from '@common/constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthStatusDto } from '@modules/health/dto';

@Controller(ENDPOINTS.HEALTH.BASE)
@ApiTags(ENDPOINTS.HEALTH.BASE)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post(ENDPOINTS.HEALTH.STATUS.ENDPOINT)
  @HttpCode(200)
  @ApiOperation(ENDPOINTS.HEALTH.STATUS.DOCKS)
  status(@Body() body: HealthStatusDto) {
    return this.healthService.status(body);
  }
}
