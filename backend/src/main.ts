import { NestFactory } from '@nestjs/core'
import { AppModule } from '@src/app.module'
import * as express from 'express'
import { NestExpressApplication } from '@nestjs/platform-express'
import { InternalDisabledLogger } from './support/logger'
import { MikroORM } from '@mikro-orm/core'
import { ConsoleLogger, Logger } from '@nestjs/common'

export const APP_NAME = 'config-server'

async function bootstrap() {
  const logger = new InternalDisabledLogger()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  })

  // increase body size limits so payloads >100KB are accepted (set as needed)
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ limit: '5mb', extended: true }))

  // Enable trust proxy
  app.set('trust proxy', 1) // trust first proxy

  // Run database migrations
  if (process.env.SKIP_MIGRATION === 'true') {
    logger.warn(`Skipping migrations as per environment variable.`, 'main')
  } else {
    await dbMigrations(app, logger)
  }

  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

async function dbMigrations(app: NestExpressApplication, logger: ConsoleLogger) {
  const orm = app.get(MikroORM)
  const migrator = orm.getMigrator()

  try {
    const pendingMigrations = await migrator.getPendingMigrations()

    if (pendingMigrations.length === 0) {
      logger.log('No pending migrations.', 'main')
      return
    }

    logger.log(`Found ${pendingMigrations.length} pending migration(s):`, 'main')
    pendingMigrations.forEach(migration => {
      logger.log(`  - ${migration.name}`, 'main')
    })

    logger.log('Executing pending migrations...', 'main')
    const executedMigrations = await migrator.up()

    if (executedMigrations.length > 0) {
      logger.log(`Successfully executed ${executedMigrations.length} migration(s):`, 'main')
      executedMigrations.forEach(migration => {
        logger.log(`  ✓ ${migration.name}`, 'main')
      })
    }
  } catch (error) {
    logger.error(`Migration failed: ${error instanceof Error ? error.message : error}`, 'main')
    throw error
  }
}
