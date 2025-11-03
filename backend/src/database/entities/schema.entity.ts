import { EntitySchema } from '@mikro-orm/sqlite'
import { BaseEntity } from './base.entity'

export interface Schema extends BaseEntity {
  fundamental: boolean
  code?: string
  programVersions: string // semver range, ref semver documentation
  description?: string
  jsonSchema: string
}

export const SchemaSchema = new EntitySchema<Schema, BaseEntity>({
  name: 'Schema',
  extends: 'BaseEntity',
  tableName: 'schema',
  properties: {
    fundamental: { type: 'boolean', default: false },
    code: { type: 'string', nullable: true },
    programVersions: { type: 'string', nullable: true, default: null },
    description: { type: 'string', nullable: true },
    jsonSchema: { type: 'jsonb', nullable: false },
  },
})
