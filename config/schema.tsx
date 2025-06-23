import { integer, pgTable, varchar, text, timestamp, json } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
 
  email: varchar({ length: 255 }).notNull().unique(),
  credits:integer()
});
export const sessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  sessionId: varchar({ length: 255 }).notNull(),
  createdBy: varchar({ length: 255 }).notNull(),
  notes: text().notNull(),

  selectedDoctor: json().notNull(),
  createdOn: timestamp().notNull(),

  conversation: json(),
  report: json(),
});