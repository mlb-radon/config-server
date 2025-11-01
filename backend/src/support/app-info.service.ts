import { Injectable, Logger } from '@nestjs/common'
import { execSync } from 'child_process'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import { readdirSync, readFileSync } from 'fs'
import { hostname, type } from 'os'
import { join } from 'path'
import { APP_NAME } from '../main'
import 'dotenv/config'
import { omit } from 'radashi'
import { AppInfo } from '@shared/app-info.model'

export interface PackageJson {
  name: string
  version: string
  description?: string
  workspaces?: string[]
  scripts?: object
  devDependencies?: object
  dependencies?: object
  jest?: object
}

@Injectable()
export class AppInfoService {
  private readonly logger = new Logger(AppInfoService.name)
  private readonly runningSince = new Date()
  private readonly verbose = process.env.VERBOSE_APP_INFO === 'true'

  getAppInfo(): AppInfo {
    try {
      const packageJson = this.loadPackageJson()
      if (!packageJson) {
        return {} as AppInfo
      }
      const toOmit = ['scripts', 'devDependencies', 'dependencies', 'jest'] as (keyof PackageJson)[]
      const packageObject = omit(packageJson, toOmit) as PackageJson
      const commit = this.getCommitId()
      const uptime = formatDuration(
        intervalToDuration({
          start: this.runningSince,
          end: new Date(),
        }),
      )
      const appInfo = {
        name: APP_NAME,
        version: packageObject.version ?? 'unknown',
        description: packageObject?.description ?? 'unknown',
        commit,
        nodeEnv: process.env.NODE_ENV ?? 'unknown',
        hostInfo: {
          hostname: hostname(),
          type: type(),
        },
        runningSince: format(this.runningSince, 'yyyy-MM-dd HH:mm:ss'),
        uptime,
      } as AppInfo
      this.logger.log(`app-info : ` + JSON.stringify(appInfo))
      return appInfo
    } catch (error) {
      this.logger.error('Failed to get app info', error)
      throw error
    }
  }

  private loadPackageJson(): PackageJson | undefined {
    try {
      const rootFolder = this.findPackageJsonDir()
      if (!rootFolder) {
        this.logger.warn('Could not find package.json directory')
        return undefined
      }

      const packagePath = join(rootFolder, 'package.json')
      const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8')) as PackageJson

      if (this.verbose) {
        console.log('Loaded package.json from:', packagePath)
        console.log(omit(packageContent, ['scripts', 'devDependencies', 'dependencies', 'jest']))
      }
      return packageContent
    } catch (error) {
      this.logger.error('Failed to load package.json', error)
      return undefined
    }
  }

  private findPackageJsonDir(): string | null {
    let currentDir = __dirname
    if (this.verbose) console.log('Searching for package.json starting from:', currentDir)

    // Look for package.json in current and parent directories
    while (currentDir !== join(currentDir, '..')) {
      if (this.verbose) console.log('Checking directory:', currentDir)
      const files = readdirSync(currentDir).filter(f => f === 'package.json')
      if (files.length > 0) {
        if (this.verbose) console.log('Found package.json in:', currentDir)
        return currentDir
      }
      currentDir = join(currentDir, '..')
    }
    return null
  }

  private getCommitId(): string {
    // Check environment variable first
    if (process.env.COMMIT) {
      return process.env.COMMIT.slice(0, 7)
    }

    // Check for git commit
    if (process.env.GIT_COMMIT) {
      return process.env.GIT_COMMIT.slice(0, 7)
    }

    try {
      const result = execSync('git rev-parse --short HEAD', {
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 5000, // 5 second timeout
      })
      return result.trim()
    } catch {
      return 'unknown'
    }
  }
}

