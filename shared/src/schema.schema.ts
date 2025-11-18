import { BaseSchema } from './base.schema'
import z from 'zod'

const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

const SemverSchema = z.string().regex(semverRegex, { message: 'Invalid semver' })

export const SchemaSchema = BaseSchema.extend({
  fundamental: z.boolean().default(false),
  code: z.string().optional(),
  programVersions: z.array(SemverSchema),
  description: z.string().optional(),
  jsonSchema: z.json(),
})

export type SchemaEntity = z.infer<typeof SchemaSchema>
