import { z } from 'zod';

/**
 * Schema for validating query parameters when listing commentary events.
 * Extends default pagination with a coerced positive limit capped at 100.
 */
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive({ message: 'limit must be a positive integer' })
    .max(100, { message: 'limit cannot exceed 100' })
    .optional(),
});

/**
 * Schema for validating the payload when creating a new commentary event.
 * Follows DB schema integrity with strict types, trims, and limits.
 */
export const createCommentarySchema = z.object({
  minute: z.coerce
    .number()
    .int()
    .nonnegative({ message: 'minute must be a non-negative integer' }),
  
  sequence: z.coerce
    .number()
    .int({ message: 'sequence must be a valid integer' }),
  
  period: z
    .string()
    .trim()
    .min(1, { message: 'period is required and cannot be empty' })
    .max(100, { message: 'period cannot exceed 100 characters' }),
  
  eventType: z
    .string()
    .trim()
    .min(1, { message: 'eventType is required and cannot be empty' })
    .max(100, { message: 'eventType cannot exceed 100 characters' }),
  
  actor: z
    .string()
    .trim()
    .max(255, { message: 'actor cannot exceed 255 characters' })
    .optional()
    .nullable(),
  
  team: z
    .string()
    .trim()
    .max(255, { message: 'team cannot exceed 255 characters' })
    .optional()
    .nullable(),
  
  message: z
    .string()
    .trim()
    .min(1, { message: 'message is required and cannot be empty' }),
  
  metadata: z
    .record(z.any())
    .optional()
    .nullable(),
  
  tags: z
    .array(z.string().trim().min(1, { message: 'tag cannot be an empty string' }))
    .optional(),
});
