import {
  Shield,
  User,
  ShieldUser,
} from 'lucide-react'
import { UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userTypes = [
  {
    label: 'Superadmin',
    value: 'SUPERADMIN',
    icon: Shield,
  },
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: ShieldUser,
  },
  {
    label: 'User',
    value: 'USER',
    icon: User,
  },

] as const

export const userStatus = [
  {
    label: 'active',
    value: 'active',
  },
  {
    label: 'inactive',
    value: 'inactive',
  },
  {
    label: 'suspended',
    value: 'suspended',
  },

] as const
