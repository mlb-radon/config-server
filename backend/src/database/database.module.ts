import { Global, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { join } from 'path'
import { SqliteDriver } from '@mikro-orm/sqlite'

const dataFolder = process.env.DATABASE_FILE_PATH?.startsWith('/')
  ? process.env.DATABASE_FILE_PATH
  : join(__dirname, '../..', process.env.DATABASE_FILE_PATH || 'data')
const dataFile = join(dataFolder, 'config-server.sqlite3')

@Global()
@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: SqliteDriver,
      entities: [join(__dirname, './entities/*.entity.js')],
      dbName: dataFile,
      autoLoadEntities: true,
      forceUndefined: true,
    }),
  ],
})
export class DatabaseModule {}
