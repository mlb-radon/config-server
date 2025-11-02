import { Module } from '@nestjs/common'
import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AppInfoService } from '@src/support/app-info.service'
import { DatabaseModule } from './database/database.module'
import { SchemaValidationService } from './schema-validation.service'
import { SchemaController } from './schema.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, SchemaController],
  providers: [AppService, AppInfoService, SchemaValidationService],
})
export class AppModule {}
