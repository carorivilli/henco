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
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { toast } from "sonner";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onRequest: () => {
            toast.loading("Iniciando sesión...");
          },
          onSuccess: () => {
            toast.dismiss();
            toast.success("¡Sesión iniciada exitosamente!");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            toast.dismiss();
            if (ctx.error.status === 401) {
              toast.error("Email o contraseña incorrectos");
            } else if (ctx.error.status === 403) {
              toast.error(
                "Por favor verifica tu email antes de iniciar sesión"
              );
            } else {
              toast.error(ctx.error.message || "Error al iniciar sesión");
            }
          },
        }
      );

      if (error) {
        console.error("Login error:", error);
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Email</FormLabel>
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
              <FormLabel className="font-medium">Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Iniciando sesión...
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline transition-colors duration-200"
          >
            Regístrate aquí
          </Link>
        </div>
      </form>
    </Form>
  );
}
