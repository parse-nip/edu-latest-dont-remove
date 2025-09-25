import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const hackathons = sqliteTable('hackathons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  startAt: integer('start_at').notNull(),
  endAt: integer('end_at').notNull(),
  status: text('status').notNull().default('upcoming'),
  maxTeamSize: integer('max_team_size').notNull().default(4),
  createdAt: integer('created_at').notNull(),
});

export const hackathonParticipants = sqliteTable('hackathon_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hackathonId: integer('hackathon_id').references(() => hackathons.id).notNull(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('participant'),
  createdAt: integer('created_at').notNull(),
});

export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hackathonId: integer('hackathon_id').references(() => hackathons.id).notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  participantId: integer('participant_id').references(() => hackathonParticipants.id).notNull(),
  createdAt: integer('created_at').notNull(),
});

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hackathonId: integer('hackathon_id').references(() => hackathons.id).notNull(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  title: text('title').notNull(),
  repoUrl: text('repo_url'),
  demoUrl: text('demo_url'),
  description: text('description'),
  submittedAt: integer('submitted_at').notNull(),
});

export const judges = sqliteTable('judges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hackathonId: integer('hackathon_id').references(() => hackathons.id).notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const scores = sqliteTable('scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  submissionId: integer('submission_id').references(() => submissions.id).notNull(),
  judgeId: integer('judge_id').references(() => judges.id).notNull(),
  criteria: text('criteria').notNull(),
  score: integer('score').notNull(),
  createdAt: integer('created_at').notNull(),
});