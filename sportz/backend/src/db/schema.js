import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

// Create match_status enum with values 'scheduled', 'live', and 'finished'
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Create matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: varchar('sport', { length: 100 }).notNull(),
  homeTeam: varchar('home_team', { length: 255 }).notNull(),
  awayTeam: varchar('away_team', { length: 255 }).notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Create commentary table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute').notNull(),
  sequence: integer('sequence').notNull(),
  period: varchar('period', { length: 100 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  actor: varchar('actor', { length: 255 }),
  team: varchar('team', { length: 255 }),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Establish Drizzle relations for easier joining and standard developer ergonomics
export const matchesRelations = relations(matches, ({ many }) => ({
  commentaries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));