import {
  pgTable,
  text,
  timestamp,
  decimal,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const productTypes = pgTable("product_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const priceTypes = pgTable("price_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  totalQuantityKg: decimal("total_quantity_kg", { precision: 10, scale: 3 }).notNull(),
  totalPricePaid: decimal("total_price_paid", { precision: 10, scale: 2 }).notNull(),
  costPerKg: decimal("cost_per_kg", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const productPriceTypes = pgTable("product_price_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  priceTypeId: uuid("price_type_id")
    .notNull()
    .references(() => priceTypes.id, { onDelete: "cascade" }),
  markupPercent: decimal("markup_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const mixes = pgTable("mixes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const mixPriceTypes = pgTable("mix_price_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixId: uuid("mix_id")
    .notNull()
    .references(() => mixes.id, { onDelete: "cascade" }),
  priceTypeId: uuid("price_type_id")
    .notNull()
    .references(() => priceTypes.id, { onDelete: "cascade" }),
  markupPercent: decimal("markup_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const mixProducts = pgTable("mix_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixId: uuid("mix_id")
    .notNull()
    .references(() => mixes.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantityKg: decimal("quantity_kg", { precision: 10, scale: 3 }).notNull(),
  partialCost: decimal("partial_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});