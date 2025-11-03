import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/lib/db";
import { products, productPriceTypes, priceTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  totalQuantityKg: z.string().min(1, "La cantidad total es requerida"),
  totalPricePaid: z.string().min(1, "El precio total es requerido"),
  costPerKg: z.string().min(1, "El costo por kg es requerido"),
  priceTypes: z.array(z.object({
    priceTypeId: z.string(),
    markupPercent: z.string().default("0"),
  })).optional(),
});

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  type: z.string().min(1, "El tipo es requerido").optional(),
  totalQuantityKg: z.string().min(1, "La cantidad total es requerida").optional(),
  totalPricePaid: z.string().min(1, "El precio total es requerido").optional(),
  costPerKg: z.string().min(1, "El costo por kg es requerido").optional(),
  priceTypes: z.array(z.object({
    priceTypeId: z.string(),
    markupPercent: z.string().default("0"),
  })).optional(),
});

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        type: products.type,
        totalQuantityKg: products.totalQuantityKg,
        totalPricePaid: products.totalPricePaid,
        costPerKg: products.costPerKg,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .orderBy(products.type, products.name);

    return allProducts;
  }),

  getAllWithPrices: baseProcedure
    .input(z.object({
      priceTypeId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const allProducts = await db
        .select({
          id: products.id,
          name: products.name,
          type: products.type,
          totalQuantityKg: products.totalQuantityKg,
          totalPricePaid: products.totalPricePaid,
          costPerKg: products.costPerKg,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .orderBy(products.type, products.name);

      // Si se especifica un tipo de precio, obtener los precios
      if (input.priceTypeId) {
        const productsWithPrices = await Promise.all(
          allProducts.map(async (product) => {
            const [priceData] = await db
              .select({
                markupPercent: productPriceTypes.markupPercent,
                finalPrice: productPriceTypes.finalPrice,
              })
              .from(productPriceTypes)
              .where(
                and(
                  eq(productPriceTypes.productId, product.id),
                  eq(productPriceTypes.priceTypeId, input.priceTypeId!)
                )
              );

            return {
              ...product,
              markupPercent: priceData?.markupPercent || "0",
              finalPrice: priceData?.finalPrice || "0",
            };
          })
        );
        return productsWithPrices;
      }

      return allProducts;
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (!product) {
        return null;
      }

      // Obtener todos los precios asociados
      const productPrices = await db
        .select({
          id: productPriceTypes.id,
          priceTypeId: productPriceTypes.priceTypeId,
          markupPercent: productPriceTypes.markupPercent,
          finalPrice: productPriceTypes.finalPrice,
          priceTypeName: priceTypes.name,
        })
        .from(productPriceTypes)
        .innerJoin(priceTypes, eq(productPriceTypes.priceTypeId, priceTypes.id))
        .where(eq(productPriceTypes.productId, input.id));

      return {
        ...product,
        priceTypes: productPrices,
      };
    }),

  create: baseProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      const costPerKg = parseFloat(input.costPerKg);

      const [newProduct] = await db
        .insert(products)
        .values({
          name: input.name,
          type: input.type,
          totalQuantityKg: input.totalQuantityKg,
          totalPricePaid: input.totalPricePaid,
          costPerKg: input.costPerKg,
          updatedAt: new Date(),
        })
        .returning();

      // Crear precios para cada tipo de precio especificado
      if (input.priceTypes && input.priceTypes.length > 0) {
        const priceTypesData = input.priceTypes.map((priceType) => {
          const markupPercent = parseFloat(priceType.markupPercent);
          const finalPrice = (costPerKg * (1 + markupPercent / 100)).toFixed(2);

          return {
            productId: newProduct.id,
            priceTypeId: priceType.priceTypeId,
            markupPercent: priceType.markupPercent,
            finalPrice,
          };
        });

        await db.insert(productPriceTypes).values(priceTypesData);
      }

      return newProduct;
    }),

  update: baseProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      const [currentProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (!currentProduct) {
        throw new Error("Producto no encontrado");
      }

      // Actualizar datos básicos del producto
      const updateData: {
        updatedAt: Date;
        name?: string;
        type?: string;
        totalQuantityKg?: string;
        totalPricePaid?: string;
        costPerKg?: string;
      } = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.type) updateData.type = input.type;
      if (input.totalQuantityKg) updateData.totalQuantityKg = input.totalQuantityKg;
      if (input.totalPricePaid) updateData.totalPricePaid = input.totalPricePaid;
      if (input.costPerKg) updateData.costPerKg = input.costPerKg;

      const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, input.id))
        .returning();

      // Actualizar precios si se proporcionaron
      if (input.priceTypes && input.priceTypes.length > 0) {
        const costPerKg = input.costPerKg
          ? parseFloat(input.costPerKg)
          : parseFloat(currentProduct.costPerKg);

        for (const priceType of input.priceTypes) {
          const markupPercent = parseFloat(priceType.markupPercent);
          const finalPrice = (costPerKg * (1 + markupPercent / 100)).toFixed(2);

          // Verificar si ya existe este precio para el producto
          const [existingPrice] = await db
            .select()
            .from(productPriceTypes)
            .where(
              and(
                eq(productPriceTypes.productId, input.id),
                eq(productPriceTypes.priceTypeId, priceType.priceTypeId)
              )
            );

          if (existingPrice) {
            // Actualizar precio existente
            await db
              .update(productPriceTypes)
              .set({
                markupPercent: priceType.markupPercent,
                finalPrice,
                updatedAt: new Date(),
              })
              .where(eq(productPriceTypes.id, existingPrice.id));
          } else {
            // Crear nuevo precio
            await db.insert(productPriceTypes).values({
              productId: input.id,
              priceTypeId: priceType.priceTypeId,
              markupPercent: priceType.markupPercent,
              finalPrice,
            });
          }
        }
      }

      return updatedProduct;
    }),

  updateProductPrice: baseProcedure
    .input(z.object({
      productId: z.string().uuid(),
      priceTypeId: z.string().uuid(),
      markupPercent: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Obtener el producto para calcular el precio final
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId));

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      const costPerKg = parseFloat(product.costPerKg);
      const markupPercent = parseFloat(input.markupPercent);
      const finalPrice = (costPerKg * (1 + markupPercent / 100)).toFixed(2);

      // Verificar si ya existe
      const [existingPrice] = await db
        .select()
        .from(productPriceTypes)
        .where(
          and(
            eq(productPriceTypes.productId, input.productId),
            eq(productPriceTypes.priceTypeId, input.priceTypeId)
          )
        );

      if (existingPrice) {
        const [updated] = await db
          .update(productPriceTypes)
          .set({
            markupPercent: input.markupPercent,
            finalPrice,
            updatedAt: new Date(),
          })
          .where(eq(productPriceTypes.id, existingPrice.id))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(productPriceTypes)
          .values({
            productId: input.productId,
            priceTypeId: input.priceTypeId,
            markupPercent: input.markupPercent,
            finalPrice,
          })
          .returning();
        return created;
      }
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});