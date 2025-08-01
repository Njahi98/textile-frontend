import { z } from 'zod';

// Base assignment schema for API responses
export const assignmentSchema = z.object({
  id: z.number(),
  date: z.string().transform((val) => new Date(val)),
  position: z.string(),
  shift: z.string(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
  worker: z.object({
    id: z.number(),
    name: z.string(),
    cin: z.string(),
    role: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  productionLine: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    capacity: z.number().optional(),
    isActive: z.boolean(),
  }),
});

// Create assignment input schema
export const createAssignmentSchema = z.object({
  workerId: z.number().int().positive('Worker ID must be a positive integer'),
  productionLineId: z.number().int().positive('Production line ID must be a positive integer'),
  position: z.string().min(1, 'Position is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  shift: z.string().min(1, 'Shift is required').max(50, 'Shift must be less than 50 characters'),
});

// Update assignment input schema (all fields optional)
export const updateAssignmentSchema = z.object({
  workerId: z.number().int().positive().optional(),
  productionLineId: z.number().int().positive().optional(),
  position: z.string().min(1).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  shift: z.string().min(1).max(50).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update');

// Bulk assignment input schema
export const bulkAssignmentSchema = z.object({
  assignments: z.array(createAssignmentSchema).min(1, 'At least one assignment is required'),
  overrideConflicts: z.boolean().optional().default(false),
});

// Query parameters for getting assignments
export const assignmentQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date format').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date format').optional(),
  workerId: z.number().int().positive().optional(),
  productionLineId: z.number().int().positive().optional(),
  shift: z.string().optional(),
  position: z.string().optional(),
});

// Calendar query parameters
export const calendarQuerySchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  workerId: z.number().int().positive().optional(),
  productionLineId: z.number().int().positive().optional(),
});

// Type exports
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>;
export type AssignmentQueryInput = z.infer<typeof assignmentQuerySchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
export type Assignment = z.infer<typeof assignmentSchema>;

// Form validation helpers
export const validateAssignmentForm = (data: unknown) => {
  try {
    return { success: true, data: createAssignmentSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
};

export const validateBulkAssignmentForm = (data: unknown) => {
  try {
    return { success: true, data: bulkAssignmentSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
};

// Common shift options
export const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' },
] as const;
