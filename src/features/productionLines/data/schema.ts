import { z } from 'zod'

const performanceSchema = z.object({
  avgErrorRate: z.number(),
  avgTimeTaken: z.number(),
}).optional().nullable()

export const productionLineSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  capacity: z.number().optional().nullable(),
  isActive: z.boolean(),
  targetOutput: z.number().optional().nullable(),
  location: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  currentAssignments: z.number(),
  dailyOutput: z.number(),
  performance: performanceSchema,
})

export type ProductionLine = z.infer<typeof productionLineSchema>
export const productionLineListSchema = z.array(productionLineSchema)
