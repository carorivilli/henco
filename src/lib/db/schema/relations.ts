import { relations } from "drizzle-orm";

// Import all tables
import { users, sessions, accounts } from "./auth";
import { products, mixes, mixProducts, productTypes, priceTypes, productPriceTypes, mixPriceTypes } from "./dietetics";


export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const mixesRelations = relations(mixes, ({ many }) => ({
  mixProducts: many(mixProducts),
  mixPriceTypes: many(mixPriceTypes),
}));

export const mixPriceTypesRelations = relations(mixPriceTypes, ({ one }) => ({
  mix: one(mixes, {
    fields: [mixPriceTypes.mixId],
    references: [mixes.id],
  }),
  priceType: one(priceTypes, {
    fields: [mixPriceTypes.priceTypeId],
    references: [priceTypes.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  mixProducts: many(mixProducts),
  productPriceTypes: many(productPriceTypes),
}));

export const priceTypesRelations = relations(priceTypes, ({ many }) => ({
  productPriceTypes: many(productPriceTypes),
  mixPriceTypes: many(mixPriceTypes),
}));

export const productPriceTypesRelations = relations(productPriceTypes, ({ one }) => ({
  product: one(products, {
    fields: [productPriceTypes.productId],
    references: [products.id],
  }),
  priceType: one(priceTypes, {
    fields: [productPriceTypes.priceTypeId],
    references: [priceTypes.id],
  }),
}));

export const mixProductsRelations = relations(mixProducts, ({ one }) => ({
  mix: one(mixes, {
    fields: [mixProducts.mixId],
    references: [mixes.id],
  }),
  product: one(products, {
    fields: [mixProducts.productId],
    references: [products.id],
  }),
}));
