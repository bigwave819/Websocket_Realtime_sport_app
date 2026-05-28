import { z } from 'zod';


const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const isIsoDate = (val) => {
  if (!isoDateRegex.test(val)) return false;
  const date = new Date(val);
  return date instanceof Date && !isNaN(date.getTime());
};


export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};


export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive({ message: 'limit must be a positive integer' })
    .max(100, { message: 'limit cannot exceed 100' })
    .optional(),
});


export const matchIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: 'id must be a positive integer' }),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1, { message: 'sport is required and cannot be empty' }),
    homeTeam: z.string().trim().min(1, { message: 'homeTeam is required and cannot be empty' }),
    awayTeam: z.string().trim().min(1, { message: 'awayTeam is required and cannot be empty' }),
    startTime: z.string().refine(isIsoDate, {
      message: 'startTime must be a valid ISO date string',
    }),
    endTime: z
      .string()
      .refine(isIsoDate, {
        message: 'endTime must be a valid ISO date string',
      })
      .optional()
      .nullable(),
    homeScore: z.coerce
      .number()
      .int()
      .nonnegative({ message: 'homeScore must be a non-negative integer' })
      .optional(),
    awayScore: z.coerce
      .number()
      .int()
      .nonnegative({ message: 'awayScore must be a non-negative integer' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'endTime must be chronologically after startTime',
          path: ['endTime'],
        });
      }
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce
    .number()
    .int()
    .nonnegative({ message: 'homeScore must be a non-negative integer' }),
  awayScore: z.coerce
    .number()
    .int()
    .nonnegative({ message: 'awayScore must be a non-negative integer' }),
});
