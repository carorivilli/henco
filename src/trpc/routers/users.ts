import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  email: z.string().email("Email inválido").optional(),
  image: z.string().url("URL de imagen inválida").optional().nullable(),
});

export const usersRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, input.id));

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return user;
    }),

  update: baseProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id));

      if (!currentUser) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar si el email ya existe (si se está cambiando)
      if (input.email && input.email !== currentUser.email) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email));

        if (existingUser) {
          throw new Error("Este email ya está en uso por otro usuario");
        }
      }

      const updateData: {
        updatedAt: Date;
        name?: string;
        email?: string;
        image?: string | null;
      } = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.image !== undefined) updateData.image = input.image;

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      return updatedUser;
    }),
});
