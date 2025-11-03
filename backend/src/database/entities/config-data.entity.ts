import { EntitySchema } from '@mikro-orm/sqlite'
import { BaseEntity } from './base.entity'

export interface ConfigData extends BaseEntity {
  code?: string
  schema: string
  environment: 'development' | 'test' | 'staging' | 'production'
  programVersions: string // semver range, ref semver documentation
  description?: string
  value: string
}

export const ConfigDataSchema = new EntitySchema<ConfigData, BaseEntity>({
  name: 'ConfigData',
  extends: 'BaseEntity',
  tableName: 'config-data',
  properties: {
    code: { type: 'string', nullable: true },
    schema: { type: 'string', nullable: false },
    environment: {
      type: 'enum',
      items: ['development', 'test', 'staging', 'production'],
      nullable: false,
    },
    programVersions: { type: 'string', nullable: true, default: null },
    description: { type: 'string', nullable: true },
    value: { type: 'jsonb', nullable: false },
  },
})
