import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('SUPERADMIN'),
  z.literal('ADMIN'),
  z.literal('USER'),
])

const userSchema = z.object({
  id: z.number(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  username: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
