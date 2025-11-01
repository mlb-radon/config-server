import { z } from 'zod'

export const SmtpServerConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535).default(587),
  secure: z.boolean().default(false),
  auth: z
    .object({
      user: z.string().min(1),
      password: z.string().min(1),
    })
    .optional(),
})

export const ConfigSchema = z.object({
  $schema: z.string().optional(),
  smtpServer: SmtpServerConfigSchema,
})

export type ConfigInput = z.input<typeof ConfigSchema>
export type ConfigModel = z.infer<typeof ConfigSchema>

