import z from 'zod'

export const BaseSchema = z.object({
  id: z.number(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().optional(),
})

export type BaseEntity = z.infer<typeof BaseSchema>
