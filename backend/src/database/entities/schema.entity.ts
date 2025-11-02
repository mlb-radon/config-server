import { EntitySchema } from '@mikro-orm/sqlite'
import { BaseEntity } from './base.entity'

export interface Schema extends BaseEntity {
  fundamental: boolean
  code?: string
  description?: string
  jsonSchema: string
}

export const SchemaSchema = new EntitySchema<Schema, BaseEntity>({
  name: 'Schema',
  extends: 'BaseEntity',
  properties: {
    fundamental: { type: 'boolean', default: false },
    code: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    jsonSchema: { type: 'jsonb', nullable: false },
  },
})
