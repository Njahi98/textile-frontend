import { z } from 'zod'

const workerSchema = z.object({
  id: z.number(),
  name: z.string(),
  cin: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z.object({
    assignments: z.number(),
    performanceRecords: z.number(),
  }).optional(),
})
export type Worker = z.infer<typeof workerSchema>

export const workerListSchema = z.array(workerSchema)
