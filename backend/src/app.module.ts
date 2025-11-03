import { Module } from '@nestjs/common'
import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AppInfoService } from '@src/support/app-info.service'
import { DatabaseModule } from './database/database.module'
import { ConfigService } from './configuration-route/config.service'
import { ConfigController } from './configuration-route/config.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, ConfigController],
  providers: [AppService, AppInfoService, ConfigService],
})
export class AppModule {}
