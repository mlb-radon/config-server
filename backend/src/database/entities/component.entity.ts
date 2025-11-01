import { EntitySchema } from '@mikro-orm/sqlite'
import { BaseEntity } from './base.entity'

export interface Definition extends BaseEntity {
  code?: string
  description?: string
  schema: string
}

export const Book = new EntitySchema<Definition, BaseEntity>({
  name: 'Definition',
  extends: 'BaseEntity',
  properties: {
    code: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    schema: { type: 'string', nullable: false },
  },
})
