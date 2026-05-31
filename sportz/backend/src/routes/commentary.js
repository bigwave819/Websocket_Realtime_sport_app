import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { matchIdParamSchema } from '../validation/matches.js';

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;


commentaryRouter.get('/', async (req, res) => {
  // 1. Validate route param :id
  const parsedParams = matchIdParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({
      error: 'Invalid match ID parameter',
      details: parsedParams.error.flatten().fieldErrors,
    });
  }

  // 2. Validate query params (limit)
  const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: parsedQuery.error.flatten().fieldErrors,
    });
  }

  const matchId = parsedParams.data.id;
  const limit = Math.min(parsedQuery.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    // 3. Fetch commentary for the match, newest events first
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Failed to list commentary:', error);
    return res.status(500).json({
      error: 'Failed to list commentary',
      details: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});


commentaryRouter.post('/', async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      error: 'Invalid match ID parameter',
      details: parsedParams.error.flatten().fieldErrors,
    });
  }

  const parsedBody = createCommentarySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      error: 'Invalid commentary payload',
      details: parsedBody.error.flatten().fieldErrors,
    });
  }

  const matchId = parsedParams.data.id;

  try {
    const [event] = await db
      .insert(commentary)
      .values({
        ...parsedBody.data,
        matchId,
      })
      .returning();

    return res.status(201).json({ data: event });
  } catch (error) {
    console.error('Failed to create commentary event:', error);
    return res.status(500).json({
      error: 'Failed to create commentary event',
      details: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});