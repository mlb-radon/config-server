import { generateRawSchema } from 'zod-to-mongoose'
import { SchemaSchema } from '@shared/schema.schema'

export const mgSchemaSchema: any = generateRawSchema({
  schema: SchemaSchema,
  options: {
    programVersions: { index: true },
  },
})
