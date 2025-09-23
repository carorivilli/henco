import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/lib/db";
import { productTypes } from "@/lib/db/schema/dietetics";
import { eq } from "drizzle-orm";

const createProductTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

const updateProductTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
});

const deleteProductTypeSchema = z.object({
  id: z.string(),
});

export const productTypesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    return await db.select().from(productTypes).orderBy(productTypes.name);
  }),

  create: baseProcedure
    .input(createProductTypeSchema)
    .mutation(async ({ input }) => {
      const [newProductType] = await db
        .insert(productTypes)
        .values({
          name: input.name,
        })
        .returning();

      return newProductType;
    }),

  update: baseProcedure
    .input(updateProductTypeSchema)
    .mutation(async ({ input }) => {
      const [updatedProductType] = await db
        .update(productTypes)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(productTypes.id, input.id))
        .returning();

      return updatedProductType;
    }),

  delete: baseProcedure
    .input(deleteProductTypeSchema)
    .mutation(async ({ input }) => {
      await db.delete(productTypes).where(eq(productTypes.id, input.id));
      return { success: true };
    }),
});