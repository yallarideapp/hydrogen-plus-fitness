import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const gymRequests = sqliteTable("gym_requests", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull(),
  userId: text("user_id"),
  clientRequestId: text("client_request_id"),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  interest: text("interest"),
  preferredDate: text("preferred_date"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  consentedAt: text("consented_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("gym_requests_user_created_idx").on(table.userId, table.createdAt),
  index("gym_requests_phone_created_idx").on(table.phone, table.createdAt),
  uniqueIndex("gym_requests_client_request_idx").on(table.clientRequestId),
]);

export const workouts = sqliteTable("gym_workouts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  consentedAt: text("consented_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("gym_workouts_user_date_idx").on(table.userId, table.date)]);

export const measurements = sqliteTable("gym_measurements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  weight: real("weight").notNull(),
  date: text("date").notNull(),
  consentedAt: text("consented_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("gym_measurements_user_date_idx").on(table.userId, table.date)]);

// A visitor's own intentions, not gym reservations or capacity allocations.
export const plannedSessions = sqliteTable("gym_planned_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  classKey: text("class_key").notNull(),
  className: text("class_name").notNull(),
  coach: text("coach").notNull(),
  category: text("category").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("planned"),
  consentedAt: text("consented_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("gym_planned_sessions_user_date_idx").on(table.userId, table.scheduledDate),
  uniqueIndex("gym_planned_sessions_unique_slot_idx").on(table.userId, table.classKey, table.scheduledDate, table.scheduledTime),
]);

export const fitnessGoals = sqliteTable("gym_fitness_goals", {
  userId: text("user_id").primaryKey(),
  focus: text("focus").notNull(),
  weeklyTarget: integer("weekly_target").notNull(),
  experience: text("experience").notNull(),
  preferredTraining: text("preferred_training").notNull(),
  notes: text("notes"),
  consentedAt: text("consented_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
