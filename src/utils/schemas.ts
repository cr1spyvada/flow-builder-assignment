import { z } from 'zod'

export const HTTPConfigSchema = z.object({
  url: z.string().url('Invalid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.string().optional(),
  body: z.string().optional()
})

export const EmailConfigSchema = z.object({
  to: z.string().min(1, 'Email is required').email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
})

export const SMSConfigSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  message: z.string().min(1, 'Message is required').max(160, 'SMS must be under 160 characters'),
})

export const ConditionConfigSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.string().min(1, 'Value is required')
})

export const TransformConfigSchema = z.object({
  script: z.string().min(1, 'Script is required')
})

export const Schemas: Record<string, z.ZodObject<any>> = {
  action_http: HTTPConfigSchema,
  action_email: EmailConfigSchema,
  action_sms: SMSConfigSchema,
  logic_condition: ConditionConfigSchema,
  logic_transform: TransformConfigSchema
}
