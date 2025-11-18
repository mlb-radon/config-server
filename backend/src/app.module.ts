import { Module } from '@nestjs/common'
import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AppInfoService } from '@src/support/app-info.service'
import { ConfigService } from './configuration-route/config.service'
import { ConfigController } from './configuration-route/config.controller'
import { MongooseModule } from '@nestjs/mongoose'

const mongo_default_url = 'mongodb://localhost:27017/config-server'

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL || mongo_default_url)],
  controllers: [AppController, ConfigController],
  providers: [AppService, AppInfoService, ConfigService],
})
export class AppModule {}
