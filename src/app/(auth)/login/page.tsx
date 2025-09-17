import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en tu cuenta",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar Sesión"
    >
      <LoginForm />
    </AuthCard>
  );
}