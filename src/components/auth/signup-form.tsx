"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/auth-client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { toast } from "sonner";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignupInput) {
    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          onRequest: () => {
            toast.loading("Creando cuenta...");
          },
          onSuccess: () => {
            toast.dismiss();
            toast.success("¡Cuenta creada exitosamente!");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            toast.dismiss();
            if (ctx.error.status === 400) {
              if (ctx.error.message?.includes("email")) {
                toast.error("Este email ya está registrado");
              } else {
                toast.error("Datos inválidos. Por favor revisa la información.");
              }
            } else if (ctx.error.status === 409) {
              toast.error("Ya existe una cuenta con este email");
            } else {
              toast.error(ctx.error.message || "Error al crear la cuenta");
            }
          },
        }
      );

      if (error) {
        console.error("Signup error:", error);
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast.error("Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </Form>
  );
}