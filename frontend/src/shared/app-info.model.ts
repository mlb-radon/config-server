export interface AppInfo {
  name: string
  version: string
  description: string
  commit: string
  nodeEnv: string
  hostInfo: {
    hostname: string
    type: string
  }
  runningSince: string
  uptime: string
}
