import { sql } from "drizzle-orm";
import { pgTable, text, boolean, integer, timestamp, numeric, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    clerkId: text("clerkId").notNull().unique(),
    email: text("email").notNull().unique(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    imageUrl: text("imageUrl"),
    isAdmin: boolean("isAdmin").notNull().default(false),
    emailSubscribed: boolean("emailSubscribed").notNull().default(true),
    timezone: text("timezone"),
    platform: text("platform"),
    clientVersion: text("clientVersion"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("User_clerkId_idx").on(table.clerkId), index("User_email_idx").on(table.email)]
);

export const openRouterLogs = pgTable(
  "OpenRouterLog",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    model: text("model").notNull(),
    inputText: text("inputText").notNull(),
    outputText: text("outputText").notNull(),
    inputTokens: integer("inputTokens").notNull(),
    outputTokens: integer("outputTokens").notNull(),
    totalTokens: integer("totalTokens").notNull(),
    inputCost: numeric("inputCost", { precision: 10, scale: 8 }).notNull(),
    outputCost: numeric("outputCost", { precision: 10, scale: 8 }).notNull(),
    totalCost: numeric("totalCost", { precision: 10, scale: 8 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("OpenRouterLog_createdAt_idx").on(table.createdAt),
    index("OpenRouterLog_model_idx").on(table.model),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OpenRouterLog = typeof openRouterLogs.$inferSelect;
export type NewOpenRouterLog = typeof openRouterLogs.$inferInsert;
