import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        Logger.log('Initializing PostgreSQL Connection...', 'DatabaseModule');
        return {
          type: 'postgres',
          host: appConfigService.postgresHost,
          port: appConfigService.postgresPort,
          username: appConfigService.postgresUser,
          password: appConfigService.postgresPassword,
          database: appConfigService.postgresDb,
          autoLoadEntities: true,
          // Note: synchronize should not be used in production - otherwise you can lose production data.
          synchronize: appConfigService.environment === 'development',
          extra: {
            connectionLimit: 10,
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) => {
        Logger.log('Initializing MongoDB Connection...', 'DatabaseModule');
        return {
          uri: appConfigService.mongoUri,
          // specific options if needed: minPoolSize, maxPoolSize, etc.
        };
      },
    }),
  ],
})
export class DatabaseModule {}
