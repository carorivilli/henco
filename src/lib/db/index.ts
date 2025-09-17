import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });

// Export the schema for external use
export { schema };

export type DatabaseConnection =
  | typeof db
  | Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];
