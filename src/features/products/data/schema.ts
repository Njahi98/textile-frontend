import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Product code is required'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitPrice: z.coerce.number().positive('Unit price must be positive').optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().min(1, 'Product code is required').optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitPrice: z.coerce.number().positive('Unit price must be positive').optional().nullable(),
  isActive: z.boolean().optional(),
});


export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitPrice: z.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


export const productListSchema = z.array(productSchema);
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Product = z.infer<typeof productSchema>;