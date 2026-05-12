import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { CONFIG, NODE_ENV } from '@common/constants';
import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => {
        const isProduction = CONFIG.NODE_ENV === NODE_ENV.PROD;
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
    }),
    HealthModule,
  ],
})
export class AppModule {}
