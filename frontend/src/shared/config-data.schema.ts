import { BaseSchema } from './base.schema'
import z from 'zod'

export const ConfigDataSchema = BaseSchema.extend({
  code: z.string().optional(),
  schema: z.string(),
  environment: z.enum(['development', 'test', 'staging', 'production']),
  programVersions: z.string().optional(),
  description: z.string().optional(),
  value: z.string(),
})

export type ConfigData = z.infer<typeof ConfigDataSchema>
