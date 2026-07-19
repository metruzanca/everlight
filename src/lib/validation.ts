import { z } from 'zod'
import { apiError } from './api-logger'

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T | Response {
  const result = schema.safeParse(data)
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    return apiError(message)
  }
  return result.data
}

export function parseQuery<T>(schema: z.ZodSchema<T>, url: URL): T | Response {
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  const result = schema.safeParse(params)
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    return apiError(message)
  }
  return result.data
}

export const createOrgSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
  domainAutoJoin: z.boolean().optional(),
})

export const updateOrgSchema = z.object({
  id: z.string().min(1, 'id is required'),
  domainAutoJoin: z.boolean().optional(),
})

export const removeMemberSchema = z.object({
  orgId: z.string().min(1, 'orgId is required'),
  userId: z.string().min(1, 'userId is required'),
})

export const deleteUserSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
})

export const createInviteSchema = z.object({
  orgId: z.string().min(1, 'orgId is required'),
  email: z.string().email('invalid email'),
  role: z.string().optional(),
})

export const tokenSchema = z.object({
  token: z.string().min(1, 'token is required'),
})

export const vapiCallsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  orgId: z.string().optional(),
})

export const orgQuerySchema = z.object({
  orgId: z.string().min(1, 'orgId is required'),
})
