import { Injectable, Logger } from '@nestjs/common'
import 'dotenv/config'
import * as fs from 'fs'
import { get } from 'radashi'
import { ConfigModel, ConfigSchema } from '../config-model/config.model'
import { join } from 'path'
import { EventEmitter } from 'events'
import { watch, FSWatcher } from 'chokidar'
import { ModuleRef } from '@nestjs/core'

export const CHANGE_IN_CONFIG_FOLDER_EVENT = 'configFolderChanged'

// More robust nested type helper
type GetNestedType<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? T[K] extends object
      ? GetNestedType<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never

// Type helper to convert array of paths to tuple of corresponding types
type PathsToTypes<T, P extends readonly string[]> = {
  [K in keyof P]: GetNestedType<T, P[K]>
}

export function getConfigPath(
  logger: Logger,
  copyFiles: boolean = false,
): { path: string; fullFilePath: string } {
  const configPath = process.env.CONFIG_FOLDER!
  const configFile = process.env.CONFIG_FILE!
  if (!process.env.HIDE_CONFIG_LOGGING) {
    console.log('process.env.CONFIG_FOLDER', process.env.CONFIG_FOLDER!)
    console.log('process.env.CONFIG_FILE', process.env.CONFIG_FILE!)
  }
  const root = join(__dirname, '..')

  // copy non-compiled files if necessary
  if (copyFiles && configPath.startsWith('.') && root.endsWith('dist')) {
    fs.mkdirSync(join(root, configPath), { recursive: true })
    const sourceFolder = join(root.replace('dist', 'src'), configPath)
    const targetFolder = join(root, configPath)
    for (const file of fs.readdirSync(sourceFolder).filter(f => !f.endsWith('.ts'))) {
      logger.log(`Copying file ${file} to ${targetFolder}`)
      const source = join(sourceFolder, file)
      const target = join(targetFolder, file)
      fs.copyFileSync(source, target)
    }
  }
  const path = join(configPath.startsWith('.') ? root : '', configPath)
  const fullFilePath = join(path, configFile)
  return { path, fullFilePath }
}

@Injectable()
export class ConfigReloaderService {
  private readonly log = new Logger(ConfigReloaderService.name)

  private config: ConfigModel
  private configPath: string
  private configFullPath: string
  private configUpdated = new EventEmitter()
  private watcher: FSWatcher

  constructor(private readonly moduleRef: ModuleRef) {
    const { path, fullFilePath } = getConfigPath(this.log, true)
    this.configPath = path
    this.configFullPath = fullFilePath
    this.log.log(`Using config file ${fullFilePath}`)

    this.loadConfig(false)
    this.watcher = watch(path, { ignoreInitial: true, persistent: true })
    this.watcher.on('all', () => this.loadConfig(true))
  }

  /**
   * Subscribe to config updates.
   * Returns an unsubscribe function.
   */
  onConfigUpdate(listener: () => void) {
    this.configUpdated.on(CHANGE_IN_CONFIG_FOLDER_EVENT, listener)
  }

  get configFolder() {
    return this.configPath
  }

  private loadConfig(reload: boolean = false) {
    // this.log.log((reload ? 'Rel' : 'L') + 'oading config...')
    try {
      // Handle compiled TypeScript config
      if (reload) delete require.cache[require.resolve(this.configFullPath)]

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const configModule = require(this.configFullPath) as { default: ConfigModel }
      const configData = configModule.default || configModule
      const result = ConfigSchema.safeParse(configData)

      if (!result.success) {
        this.log.error(`Invalid config: ${result.error.message}`)
        return
      }
      this.config = result.data!
      this.configUpdated.emit(CHANGE_IN_CONFIG_FOLDER_EVENT)
    } catch (error) {
      this.log.error(
        'Failed to load config: ' +
          (error instanceof Error ? error.message : JSON.stringify(error)),
      )
    }
  }

  get<T>(key: string): T | undefined
  get<T>(key: string, dflt: T): T
  get<T>(key: string, dflt?: T): T | undefined {
    if (dflt === undefined) return get<T>(this.config ?? dflt, key) as T | undefined
    return (get<T>(this.config, key) ?? dflt) as T
  }

  // getManyArray<T extends readonly string[]>(paths: T): PathsToTypes<ConfigModel, T> {
  //   return paths.map(p => this.get(p)) as PathsToTypes<ConfigModel, T>
  // }

  // // Version that filters out undefined values and adjusts types accordingly
  // getManyDefined<T extends readonly string[]>(
  //   ...paths: T
  // ): Array<NonNullable<PathsToTypes<ConfigModel, T>[number]>> {
  //   return paths.map(p => this.get(p)).filter(v => v !== undefined) as Array<
  //     NonNullable<PathsToTypes<ConfigModel, T>[number]>
  //   >
  // }

  getManyConst<const T extends readonly string[]>(...paths: T): PathsToTypes<ConfigModel, T> {
    return paths.map(p => this.get(p)) as PathsToTypes<ConfigModel, T>
  }

  // // Version that forces literal type preservation
  // getManyLiteral<T extends readonly string[]>(...paths: [...T]): PathsToTypes<ConfigModel, T> {
  //   return paths.map(p => this.get(p)) as PathsToTypes<ConfigModel, T>
  // }
}

