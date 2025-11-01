import { NestFactory } from '@nestjs/core'
import { AppModule } from '@src/app.module'
import * as express from 'express'
import { NestExpressApplication } from '@nestjs/platform-express'

export const APP_NAME = 'config-server'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // increase body size limits so payloads >100KB are accepted (set as needed)
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ limit: '5mb', extended: true }))

  // Enable trust proxy
  app.set('trust proxy', 1) // trust first proxy

  // Run database migrations
  if (process.env.SKIP_MIGRATION === 'true') {
    console.log(`Skipping migrations as per environment variable.`)
  } else {
    // await dbMigrations(app)
  }

  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
function dbMigrations(app: NestExpressApplication) {
  // throw new Error('Function not implemented.')
}
