import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/lib/db";
import { mixes, mixProducts, products, mixPriceTypes, priceTypes } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

const createMixSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  productIds: z.array(z.string().uuid()).min(1, "Debe seleccionar al menos un producto"),
  priceTypes: z.array(z.object({
    priceTypeId: z.string(),
    markupPercent: z.string().default("0"),
  })).optional(),
});

const createMixWithQuantitiesSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  products: z.array(z.object({
    productId: z.string().uuid(),
    quantityKg: z.string().min(1, "La cantidad es requerida"),
  })).min(1, "Debe agregar al menos un producto"),
  priceTypes: z.array(z.object({
    priceTypeId: z.string(),
    markupPercent: z.string().default("0"),
  })).optional(),
});

const addProductToMixSchema = z.object({
  mixId: z.string().uuid(),
  productId: z.string().uuid(),
  quantityKg: z.number().positive("La cantidad debe ser mayor a 0"),
});

const updateMixSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  priceTypes: z.array(z.object({
    priceTypeId: z.string(),
    markupPercent: z.string().default("0"),
  })).optional(),
});

const updateMixProductSchema = z.object({
  id: z.string().uuid(),
  quantityKg: z.number().positive("La cantidad debe ser mayor a 0"),
});

// Helper function to recalculate mix total cost and prices
const recalculateMixTotal = async (mixId: string) => {
  const result = await db
    .select({
      total: sql<string>`COALESCE(SUM(${mixProducts.partialCost}), 0)`,
    })
    .from(mixProducts)
    .where(eq(mixProducts.mixId, mixId));

  const totalCost = result[0]?.total || "0";

  // Update mix total cost
  await db
    .update(mixes)
    .set({
      totalCost,
      updatedAt: new Date(),
    })
    .where(eq(mixes.id, mixId));

  // Recalculate prices for all price types
  const mixPrices = await db
    .select()
    .from(mixPriceTypes)
    .where(eq(mixPriceTypes.mixId, mixId));

  for (const mixPrice of mixPrices) {
    const markupPercent = parseFloat(mixPrice.markupPercent);
    const cost = parseFloat(totalCost);
    const finalPrice = (cost * (1 + markupPercent / 100)).toFixed(2);

    await db
      .update(mixPriceTypes)
      .set({
        finalPrice,
        updatedAt: new Date(),
      })
      .where(eq(mixPriceTypes.id, mixPrice.id));
  }
};

export const mixesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    const mixesData = await db.select().from(mixes).orderBy(mixes.createdAt);

    // Get products for each mix
    const mixesWithProducts = await Promise.all(
      mixesData.map(async (mix) => {
        const mixProductsList = await db
          .select({
            product: {
              id: products.id,
              name: products.name,
              type: products.type,
            },
          })
          .from(mixProducts)
          .innerJoin(products, eq(mixProducts.productId, products.id))
          .where(eq(mixProducts.mixId, mix.id));

        return {
          ...mix,
          products: mixProductsList.map(mp => mp.product),
        };
      })
    );

    return mixesWithProducts;
  }),

  getAllWithPrices: baseProcedure
    .input(z.object({
      priceTypeId: z.string().optional(),
      priceTypeName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const mixesData = await db.select().from(mixes).orderBy(mixes.createdAt);

      // Determinar si es tipo mayorista
      const isMayorista = input.priceTypeName?.toLowerCase().includes('mayorista') || false;

      // Obtener productos y peso total para cada mix
      const mixesWithProducts = await Promise.all(
        mixesData.map(async (mix) => {
          const mixProductsList = await db
            .select({
              product: {
                id: products.id,
                name: products.name,
                type: products.type,
              },
            })
            .from(mixProducts)
            .innerJoin(products, eq(mixProducts.productId, products.id))
            .where(eq(mixProducts.mixId, mix.id));

          // Calcular peso total del mix
          const totalWeightResult = await db
            .select({
              total: sql<string>`COALESCE(SUM(${mixProducts.quantityKg}), 0)`,
            })
            .from(mixProducts)
            .where(eq(mixProducts.mixId, mix.id));

          const totalWeight = parseFloat(totalWeightResult[0]?.total || "0");

          // Si es mayorista, filtrar solo mix con peso >= 5kg
          if (isMayorista && totalWeight < 5) {
            return null; // Excluir este mix
          }

          // Si se especifica un tipo de precio, obtener los precios
          if (input.priceTypeId) {
            const [priceData] = await db
              .select({
                markupPercent: mixPriceTypes.markupPercent,
                finalPrice: mixPriceTypes.finalPrice,
              })
              .from(mixPriceTypes)
              .where(
                and(
                  eq(mixPriceTypes.mixId, mix.id),
                  eq(mixPriceTypes.priceTypeId, input.priceTypeId!)
                )
              );

            return {
              ...mix,
              products: mixProductsList.map(mp => mp.product),
              totalWeight: totalWeight.toFixed(3),
              markupPercent: priceData?.markupPercent || "0",
              finalPrice: priceData?.finalPrice || "0",
            };
          }

          return {
            ...mix,
            products: mixProductsList.map(mp => mp.product),
            totalWeight: totalWeight.toFixed(3),
          };
        })
      );

      // Filtrar los mix nulos (excluidos por peso mínimo)
      return mixesWithProducts.filter(mix => mix !== null);
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [mix] = await db
        .select()
        .from(mixes)
        .where(eq(mixes.id, input.id));

      if (!mix) return null;

      const mixProductsList = await db
        .select({
          id: mixProducts.id,
          quantityKg: mixProducts.quantityKg,
          partialCost: mixProducts.partialCost,
          product: {
            id: products.id,
            name: products.name,
            type: products.type,
            costPerKg: products.costPerKg,
          },
        })
        .from(mixProducts)
        .innerJoin(products, eq(mixProducts.productId, products.id))
        .where(eq(mixProducts.mixId, input.id));

      // Obtener todos los precios asociados
      const mixPrices = await db
        .select({
          id: mixPriceTypes.id,
          priceTypeId: mixPriceTypes.priceTypeId,
          markupPercent: mixPriceTypes.markupPercent,
          finalPrice: mixPriceTypes.finalPrice,
          priceTypeName: priceTypes.name,
        })
        .from(mixPriceTypes)
        .innerJoin(priceTypes, eq(mixPriceTypes.priceTypeId, priceTypes.id))
        .where(eq(mixPriceTypes.mixId, input.id));

      return {
        ...mix,
        products: mixProductsList,
        priceTypes: mixPrices,
      };
    }),

  create: baseProcedure
    .input(createMixSchema)
    .mutation(async ({ input }) => {
      // Create the mix first
      const [newMix] = await db
        .insert(mixes)
        .values({
          name: input.name,
          totalCost: "0",
          updatedAt: new Date(),
        })
        .returning();

      // Add selected products to the mix with default quantity of 1kg
      if (input.productIds.length > 0) {
        for (const productId of input.productIds) {
          // Get product cost
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId));

          if (product) {
            const partialCost = (parseFloat(product.costPerKg) * 1).toFixed(2);

            await db.insert(mixProducts).values({
              mixId: newMix.id,
              productId: productId,
              quantityKg: "1.000",
              partialCost,
              updatedAt: new Date(),
            });
          }
        }

        // Recalculate total cost after adding products
        await recalculateMixTotal(newMix.id);
      }

      // Crear precios para cada tipo de precio especificado
      if (input.priceTypes && input.priceTypes.length > 0) {
        const totalCost = parseFloat((await db.select().from(mixes).where(eq(mixes.id, newMix.id)))[0].totalCost);

        const priceTypesData = input.priceTypes.map((priceType) => {
          const markupPercent = parseFloat(priceType.markupPercent);
          const finalPrice = (totalCost * (1 + markupPercent / 100)).toFixed(2);

          return {
            mixId: newMix.id,
            priceTypeId: priceType.priceTypeId,
            markupPercent: priceType.markupPercent,
            finalPrice,
          };
        });

        await db.insert(mixPriceTypes).values(priceTypesData);
      }

      return newMix;
    }),

  createWithQuantities: baseProcedure
    .input(createMixWithQuantitiesSchema)
    .mutation(async ({ input }) => {
      // Create the mix first
      const [newMix] = await db
        .insert(mixes)
        .values({
          name: input.name,
          totalCost: "0",
          updatedAt: new Date(),
        })
        .returning();

      // Add products with specified quantities
      if (input.products.length > 0) {
        for (const productInput of input.products) {
          // Get product cost
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productInput.productId));

          if (product) {
            const quantity = parseFloat(productInput.quantityKg);
            const partialCost = (parseFloat(product.costPerKg) * quantity).toFixed(2);

            await db.insert(mixProducts).values({
              mixId: newMix.id,
              productId: productInput.productId,
              quantityKg: quantity.toFixed(3),
              partialCost,
              updatedAt: new Date(),
            });
          }
        }

        // Recalculate total cost after adding products
        await recalculateMixTotal(newMix.id);
      }

      // Crear precios para cada tipo de precio especificado
      if (input.priceTypes && input.priceTypes.length > 0) {
        const updatedMix = await db.select().from(mixes).where(eq(mixes.id, newMix.id));
        const totalCost = parseFloat(updatedMix[0].totalCost);

        const priceTypesData = input.priceTypes.map((priceType) => {
          const markupPercent = parseFloat(priceType.markupPercent);
          const finalPrice = (totalCost * (1 + markupPercent / 100)).toFixed(2);

          return {
            mixId: newMix.id,
            priceTypeId: priceType.priceTypeId,
            markupPercent: priceType.markupPercent,
            finalPrice,
          };
        });

        await db.insert(mixPriceTypes).values(priceTypesData);
      }

      return newMix;
    }),

  update: baseProcedure
    .input(updateMixSchema)
    .mutation(async ({ input }) => {
      const [currentMix] = await db
        .select()
        .from(mixes)
        .where(eq(mixes.id, input.id));

      if (!currentMix) {
        throw new Error("Mix no encontrado");
      }

      // Actualizar datos básicos del mix
      const updateData: { updatedAt: Date; name?: string } = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;

      const [updatedMix] = await db
        .update(mixes)
        .set(updateData)
        .where(eq(mixes.id, input.id))
        .returning();

      // Actualizar precios si se proporcionaron
      if (input.priceTypes && input.priceTypes.length > 0) {
        const totalCost = parseFloat(currentMix.totalCost);

        for (const priceType of input.priceTypes) {
          const markupPercent = parseFloat(priceType.markupPercent);
          const finalPrice = (totalCost * (1 + markupPercent / 100)).toFixed(2);

          // Verificar si ya existe este precio para el mix
          const [existingPrice] = await db
            .select()
            .from(mixPriceTypes)
            .where(
              and(
                eq(mixPriceTypes.mixId, input.id),
                eq(mixPriceTypes.priceTypeId, priceType.priceTypeId)
              )
            );

          if (existingPrice) {
            // Actualizar precio existente
            await db
              .update(mixPriceTypes)
              .set({
                markupPercent: priceType.markupPercent,
                finalPrice,
                updatedAt: new Date(),
              })
              .where(eq(mixPriceTypes.id, existingPrice.id));
          } else {
            // Crear nuevo precio
            await db.insert(mixPriceTypes).values({
              mixId: input.id,
              priceTypeId: priceType.priceTypeId,
              markupPercent: priceType.markupPercent,
              finalPrice,
            });
          }
        }
      }

      return updatedMix;
    }),

  updateMixPrice: baseProcedure
    .input(z.object({
      mixId: z.string().uuid(),
      priceTypeId: z.string().uuid(),
      markupPercent: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Obtener el mix para calcular el precio final
      const [mix] = await db
        .select()
        .from(mixes)
        .where(eq(mixes.id, input.mixId));

      if (!mix) {
        throw new Error("Mix no encontrado");
      }

      const totalCost = parseFloat(mix.totalCost);
      const markupPercent = parseFloat(input.markupPercent);
      const finalPrice = (totalCost * (1 + markupPercent / 100)).toFixed(2);

      // Verificar si ya existe
      const [existingPrice] = await db
        .select()
        .from(mixPriceTypes)
        .where(
          and(
            eq(mixPriceTypes.mixId, input.mixId),
            eq(mixPriceTypes.priceTypeId, input.priceTypeId)
          )
        );

      if (existingPrice) {
        const [updated] = await db
          .update(mixPriceTypes)
          .set({
            markupPercent: input.markupPercent,
            finalPrice,
            updatedAt: new Date(),
          })
          .where(eq(mixPriceTypes.id, existingPrice.id))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(mixPriceTypes)
          .values({
            mixId: input.mixId,
            priceTypeId: input.priceTypeId,
            markupPercent: input.markupPercent,
            finalPrice,
          })
          .returning();
        return created;
      }
    }),

  addProduct: baseProcedure
    .input(addProductToMixSchema)
    .mutation(async ({ input }) => {
      // Get product cost per kg
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId));

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Calculate partial cost
      const partialCost = (parseFloat(product.costPerKg) * input.quantityKg).toFixed(2);

      // Add product to mix
      const [newMixProduct] = await db
        .insert(mixProducts)
        .values({
          mixId: input.mixId,
          productId: input.productId,
          quantityKg: input.quantityKg.toString(),
          partialCost,
          updatedAt: new Date(),
        })
        .returning();

      // Recalculate total cost
      await recalculateMixTotal(input.mixId);

      return newMixProduct;
    }),

  updateProduct: baseProcedure
    .input(updateMixProductSchema)
    .mutation(async ({ input }) => {
      // Get mix product with product info
      const [mixProduct] = await db
        .select({
          mixProduct: mixProducts,
          product: products,
        })
        .from(mixProducts)
        .innerJoin(products, eq(mixProducts.productId, products.id))
        .where(eq(mixProducts.id, input.id));

      if (!mixProduct) {
        throw new Error("Producto en mix no encontrado");
      }

      // Calculate new partial cost
      const partialCost = (parseFloat(mixProduct.product.costPerKg) * input.quantityKg).toFixed(2);

      // Update mix product
      const [updatedMixProduct] = await db
        .update(mixProducts)
        .set({
          quantityKg: input.quantityKg.toString(),
          partialCost,
          updatedAt: new Date(),
        })
        .where(eq(mixProducts.id, input.id))
        .returning();

      // Recalculate total cost
      await recalculateMixTotal(mixProduct.mixProduct.mixId);

      return updatedMixProduct;
    }),

  removeProduct: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      // Get mix ID before deleting
      const [mixProduct] = await db
        .select()
        .from(mixProducts)
        .where(eq(mixProducts.id, input.id));

      if (!mixProduct) {
        throw new Error("Producto en mix no encontrado");
      }

      const mixId = mixProduct.mixId;

      // Delete mix product
      await db.delete(mixProducts).where(eq(mixProducts.id, input.id));

      // Recalculate total cost
      await recalculateMixTotal(mixId);

      return { success: true };
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(mixes).where(eq(mixes.id, input.id));
      return { success: true };
    }),
});