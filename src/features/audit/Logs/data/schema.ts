import { z } from 'zod'

const auditLogSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().nullable(),
  tableName: z.string().nullable(),
  oldValues: z.any().nullable(),
  newValues: z.any().nullable(),
  metadata: z.any().nullable(),
  description: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    role: z.string(),
  }).optional(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

export const auditLogListSchema = z.array(auditLogSchema)
