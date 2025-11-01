import { ConsoleLogger } from '@nestjs/common'

const contextsToIgnore = [
  'InstanceLoader',
  'RoutesResolver',
  'RouterExplorer',
  'NestFactory', // I prefer not including this one
]

/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export class InternalDisabledLogger extends ConsoleLogger {
  log(message: any, context?: string, ...rest: unknown[]): void {
    if (!context || !contextsToIgnore.includes(context)) {
      super.log(message, context, ...rest)
    }
  }
}
