import { Module } from '@nestjs/common'
import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AppInfoService } from '@src/support/app-info.service'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService, AppInfoService],
})
export class AppModule {}
