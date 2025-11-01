import { EntitySchema } from '@mikro-orm/sqlite'
import { BaseEntity } from './base.entity'

export interface Definition extends BaseEntity {
  code?: string
  description?: string
  schema: string
  parents?: Definition[]
  children?: Definition[]
}

export const DefinitionShema = new EntitySchema<Definition, BaseEntity>({
  name: 'Definition',
  extends: 'BaseEntity',
  properties: {
    code: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    schema: { type: 'string', nullable: false },
    parents: {
      kind: 'm:n',
      entity: () => DefinitionShema,
      inversedBy: 'children',
    },
    children: {
      kind: 'm:n',
      entity: () => DefinitionShema,
      mappedBy: 'parents',
    },
  },
})
