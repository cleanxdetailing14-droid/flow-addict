import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  pwd: text().notNull(),
  initials: text().notNull().default(""),
  offer: text().notNull().default("Formation Starter"),
  status: text().notNull().default("paye"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial().primaryKey(),
  titre: text().notNull(),
  type: text().notNull().default("video"),
  duree: text().notNull().default(""),
  offre: text().notNull().default("all"),
  description: text().notNull().default(""),
  statut: text().notNull().default("publie"),
  createdAt: timestamp("created_at").defaultNow(),
});
