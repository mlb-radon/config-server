const { SqliteDriver } = require('@mikro-orm/sqlite')
const { defineConfig } = require('@mikro-orm/core')
const { join } = require('path')

const dataFolder = process.env.DATA_FOLDER?.startsWith('/')
  ? process.env.DATA_FOLDER
  : join(__dirname, 'data')
const dataFile = join(dataFolder, 'config-server.sqlite3')

module.exports = defineConfig({
  driver: SqliteDriver,
  entities: ['./src/database/entities/**/*.entity.ts'],
  entitiesTs: ['./src/database/entities/**/*.entity.ts'],
  dbName: dataFile,
  forceUndefined: true,
  migrations: {
    path: './src/database/migrations',
    pathTs: './src/database/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    emit: 'js',
  },
  tsNode: {
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es2017',
    },
  },
})
