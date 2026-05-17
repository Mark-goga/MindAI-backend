import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { CONFIG, NODE_ENV } from '@common/constants';
import { DatabaseModule } from '@common/database/database.module';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ReleasesModule } from '@modules/releases/releases.module';

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
    DatabaseModule,
    HealthModule,
    AuthModule,
    ReleasesModule,
  ],
})
export class AppModule {}
