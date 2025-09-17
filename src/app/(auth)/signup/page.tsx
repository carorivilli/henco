import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Crea una nueva cuenta para comenzar",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Crear Cuenta"
    >
      <SignupForm />
    </AuthCard>
  );
}