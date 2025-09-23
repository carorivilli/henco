import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { productsRouter } from "./products";
import { mixesRouter } from "./mixes";
import { productTypesRouter } from "./productTypes";
import { priceTypesRouter } from "./priceTypes";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  products: productsRouter,
  mixes: mixesRouter,
  productTypes: productTypesRouter,
  priceTypes: priceTypesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
