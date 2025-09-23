import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, baseProcedure } from "../init";
import { db } from "@/lib/db";
import { priceTypes } from "@/lib/db/schema";

export const priceTypesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    const allPriceTypes = await db.select().from(priceTypes);
    return allPriceTypes;
  }),

  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [priceType] = await db
        .select()
        .from(priceTypes)
        .where(eq(priceTypes.id, input.id));

      if (!priceType) {
        throw new Error("Tipo de precio no encontrado");
      }

      return priceType;
    }),

  create: baseProcedure
    .input(
      z.object({
        name: z.string().min(1, "El nombre es requerido"),
        description: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Si se está marcando como default, desmarcar todos los otros
      if (input.isDefault) {
        await db.update(priceTypes).set({ isDefault: false });
      }

      const [newPriceType] = await db
        .insert(priceTypes)
        .values({
          name: input.name,
          description: input.description,
          isDefault: input.isDefault,
        })
        .returning();

      return newPriceType;
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "El nombre es requerido"),
        description: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Si se está marcando como default, desmarcar todos los otros
      if (input.isDefault) {
        await db
          .update(priceTypes)
          .set({ isDefault: false })
          .where(eq(priceTypes.id, input.id));
      }

      const [updatedPriceType] = await db
        .update(priceTypes)
        .set({
          name: input.name,
          description: input.description,
          isDefault: input.isDefault,
          updatedAt: new Date(),
        })
        .where(eq(priceTypes.id, input.id))
        .returning();

      if (!updatedPriceType) {
        throw new Error("Tipo de precio no encontrado");
      }

      return updatedPriceType;
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Verificar si es el tipo de precio por defecto
      const [priceType] = await db
        .select()
        .from(priceTypes)
        .where(eq(priceTypes.id, input.id));

      if (!priceType) {
        throw new Error("Tipo de precio no encontrado");
      }

      if (priceType.isDefault) {
        throw new Error("No se puede eliminar el tipo de precio por defecto");
      }

      await db.delete(priceTypes).where(eq(priceTypes.id, input.id));

      return { success: true };
    }),

  setDefault: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Desmarcar todos como default
      await db.update(priceTypes).set({ isDefault: false });

      // Marcar el seleccionado como default
      const [updatedPriceType] = await db
        .update(priceTypes)
        .set({
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(eq(priceTypes.id, input.id))
        .returning();

      if (!updatedPriceType) {
        throw new Error("Tipo de precio no encontrado");
      }

      return updatedPriceType;
    }),

  getDefault: baseProcedure.query(async () => {
    const [defaultPriceType] = await db
      .select()
      .from(priceTypes)
      .where(eq(priceTypes.isDefault, true));

    return defaultPriceType || null;
  }),
});