import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  timestamp,
  boolean,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  password: text('password'),
  role: varchar('role', { length: 20, enum: ['admin', 'uploader', 'approver', 'user'] }).notNull().default('user'),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tracts table
export const tracts = pgTable('tracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  denomination: varchar('denomination', { length: 100 }),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  fileUrl: text('file_url').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  downloadCount: integer('download_count').notNull().default(0),
  status: varchar('status', { length: 20, enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  authorIdx: index('tracts_author_idx').on(table.authorId),
  statusIdx: index('tracts_status_idx').on(table.status),
  featuredIdx: index('tracts_featured_idx').on(table.featured),
}));

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parentId),
}));

// Tags table
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('tags_slug_idx').on(table.slug),
}));

// Scripture References table
export const scriptureReferences = pgTable('scripture_references', {
  id: uuid('id').primaryKey().defaultRandom(),
  book: varchar('book', { length: 50 }).notNull(),
  chapter: integer('chapter').notNull(),
  verseStart: integer('verse_start'),
  verseEnd: integer('verse_end'),
  version: varchar('version', { length: 20 }).notNull().default('NIV'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Junction tables
export const tractCategories = pgTable('tract_categories', {
  tractId: uuid('tract_id').notNull().references(() => tracts.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.tractId, table.categoryId] }),
  tractIdx: index('tract_categories_tract_idx').on(table.tractId),
  categoryIdx: index('tract_categories_category_idx').on(table.categoryId),
}));

export const tractTags = pgTable('tract_tags', {
  tractId: uuid('tract_id').notNull().references(() => tracts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.tractId, table.tagId] }),
  tractIdx: index('tract_tags_tract_idx').on(table.tractId),
  tagIdx: index('tract_tags_tag_idx').on(table.tagId),
}));

export const tractScriptures = pgTable('tract_scriptures', {
  tractId: uuid('tract_id').notNull().references(() => tracts.id, { onDelete: 'cascade' }),
  scriptureId: uuid('scripture_id').notNull().references(() => scriptureReferences.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.tractId, table.scriptureId] }),
  tractIdx: index('tract_scriptures_tract_idx').on(table.tractId),
  scriptureIdx: index('tract_scriptures_scripture_idx').on(table.scriptureId),
}));

// Downloads tracking
export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tractId: uuid('tract_id').notNull().references(() => tracts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  downloadedAt: timestamp('downloaded_at').notNull().defaultNow(),
}, (table) => ({
  tractIdx: index('downloads_tract_idx').on(table.tractId),
  userIdx: index('downloads_user_idx').on(table.userId),
  dateIdx: index('downloads_date_idx').on(table.downloadedAt),
}));

// Sessions table for NextAuth
export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// Verification tokens for NextAuth
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// Accounts table for NextAuth OAuth
export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  userIdx: index('accounts_user_idx').on(table.userId),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tract = typeof tracts.$inferSelect;
export type NewTract = typeof tracts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ScriptureReference = typeof scriptureReferences.$inferSelect;
export type NewScriptureReference = typeof scriptureReferences.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;