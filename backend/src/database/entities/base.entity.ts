import { EntitySchema } from '@mikro-orm/sqlite'

export interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt?: Date
}

export const BaseSchema = new EntitySchema<BaseEntity>({
  name: 'BaseEntity',
  abstract: true,
  properties: {
    id: { type: 'number', autoincrement: true, primary: true },
    createdAt: { type: 'Date', defaultRaw: 'CURRENT_TIMESTAMP' },
    updatedAt: {
      type: 'Date',
      nullable: true,
      onUpdate: () => new Date(),
    },
  },
})
