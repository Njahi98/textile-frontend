import { z } from 'zod';

const shiftSchema = z.enum(['morning', 'afternoon', 'night'], {
  errorMap: () => ({ message: 'Shift must be morning, afternoon, or night' })
});


export const performanceRecordSchema = z.object({
  id: z.number(),
  workerId: z.number(),
  productId: z.number(),
  productionLineId: z.number(),
  date: z.string().transform((val) => new Date(val)),
  piecesMade: z.number(),
  shift: z.string().optional(),
  timeTaken: z.number(),
  errorRate: z.number(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
  worker: z.object({
    id: z.number(),
    name: z.string(),
    cin: z.string(),
    role: z.string().optional(),
  }),
  product: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    category: z.string().optional().nullable(),
  }),
  productionLine: z.object({
    id: z.number(),
    name: z.string(),
    location: z.string().optional(),
  }),
});


export const createPerformanceRecordSchema = z.object({
  workerId: z.number().int().positive('Worker ID must be a positive integer'),
  productId: z.number().int().positive('Product ID must be a positive integer'),
  productionLineId: z.number().int().positive('Production line ID must be a positive integer'),
  date: z.coerce.date({
    errorMap: () => ({ message: 'Invalid date format' })
  }),
  piecesMade: z.number().int().min(0, 'Pieces made must be non-negative'),
  shift: shiftSchema.optional(),
  timeTaken: z.number().min(0, 'Time taken must be non-negative'),
  errorRate: z.number().min(0, 'Error rate must be non-negative').max(100, 'Error rate cannot exceed 100%'),
});


export const updatePerformanceRecordSchema = z.object({
  workerId: z.number().int().positive('Worker ID must be a positive integer').optional(),
  productId: z.number().int().positive('Product ID must be a positive integer').optional(),
  productionLineId: z.number().int().positive('Production line ID must be a positive integer').optional(),
  date: z.coerce.date({
    errorMap: () => ({ message: 'Invalid date format' })
  }).optional(),
  piecesMade: z.number().int().min(0, 'Pieces made must be non-negative').optional(),
  shift: shiftSchema.optional(),
  timeTaken: z.number().min(0, 'Time taken must be non-negative').optional(),
  errorRate: z.number().min(0, 'Error rate must be non-negative').max(100, 'Error rate cannot exceed 100%').optional(),
});


export const performanceRecordQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  workerId: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  productionLineId: z.coerce.number().int().positive().optional(),
  shift: shiftSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});


export type CreatePerformanceRecordInput = z.infer<typeof createPerformanceRecordSchema>;
export type UpdatePerformanceRecordInput = z.infer<typeof updatePerformanceRecordSchema>;
export type PerformanceRecordQueryInput = z.infer<typeof performanceRecordQuerySchema>;
export type PerformanceRecord = z.infer<typeof performanceRecordSchema>;


export const validatePerformanceRecordForm = (data: unknown) => {
  try {
    return { success: true, data: createPerformanceRecordSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
};


export const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' },
] as const;
