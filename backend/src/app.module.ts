import { Module } from '@nestjs/common'
import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AppInfoService } from '@src/support/app-info.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppInfoService],
})
export class AppModule {}
