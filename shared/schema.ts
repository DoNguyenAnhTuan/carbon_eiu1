import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  initials: text("initials"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  initials: true,
});

// Site model
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  meterCount: integer("meter_count").default(0),
});

export const insertSiteSchema = createInsertSchema(sites).pick({
  name: true,
  latitude: true,
  longitude: true,
  meterCount: true,
});

// Energy consumption model
export const energyConsumption = pgTable("energy_consumption", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  date: timestamp("date").notNull(),
  electricityCost: doublePrecision("electricity_cost").notNull(),
  gasCost: doublePrecision("gas_cost").notNull(),
  smartqubeBenefits: doublePrecision("smartqube_benefits").notNull(),
  electricityConsumption: doublePrecision("electricity_consumption").notNull(),
  gasConsumption: doublePrecision("gas_consumption").notNull(),
});

export const insertEnergyConsumptionSchema = createInsertSchema(energyConsumption).pick({
  siteId: true,
  date: true,
  electricityCost: true,
  gasCost: true,
  smartqubeBenefits: true,
  electricityConsumption: true,
  gasConsumption: true,
});

// Asset model
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  isSmartMeter: boolean("is_smart_meter").default(false),
  isFlexible: boolean("is_flexible").default(false),
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  siteId: true,
  name: true,
  type: true,
  isSmartMeter: true,
  isFlexible: true,
});

// Monthly consumption data for charts
export const monthlyConsumption = pgTable("monthly_consumption", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  electricityConsumption: doublePrecision("electricity_consumption").notNull(),
  gasConsumption: doublePrecision("gas_consumption").notNull(),
});

export const insertMonthlyConsumptionSchema = createInsertSchema(monthlyConsumption).pick({
  month: true,
  year: true,
  electricityConsumption: true,
  gasConsumption: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type EnergyConsumption = typeof energyConsumption.$inferSelect;
export type InsertEnergyConsumption = z.infer<typeof insertEnergyConsumptionSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type MonthlyConsumption = typeof monthlyConsumption.$inferSelect;
export type InsertMonthlyConsumption = z.infer<typeof insertMonthlyConsumptionSchema>;

// Define the hourly consumption schema
export const hourlyConsumption = pgTable("hourly_consumption", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  date: date("date").notNull(),
  hour: integer("hour").notNull(),
  electricityConsumption: numeric("electricity_consumption").notNull(),
  gasConsumption: numeric("gas_consumption").notNull()
});

export const insertHourlyConsumptionSchema = createInsertSchema(hourlyConsumption).pick({
  siteId: true,
  date: true,
  hour: true,
  electricityConsumption: true,
  gasConsumption: true
});

export type HourlyConsumption = typeof hourlyConsumption.$inferSelect;
export type InsertHourlyConsumption = z.infer<typeof insertHourlyConsumptionSchema>;
