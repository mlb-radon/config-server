import { Global, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { join } from 'path'
import { SqliteDriver } from '@mikro-orm/sqlite'

const dataFolder = process.env.DATA_FOLDER?.startsWith('/')
  ? process.env.DATA_FOLDER
  : join(__dirname, process.env.DATA_FOLDER || 'data')
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
