import { initTRPC } from "@trpc/server";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next, path, type }) => {
  const start = Date.now();

  const result = await next();

  const durationMs = Date.now() - start;
  const meta = `${path} - ${type} - ${durationMs}ms`;

  if (result.ok) {
    console.log(`${meta} - OK`);
  } else {
    console.error(`${meta} - ERROR`, result.error);
  }

  return result;
});
