import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Crea una nueva cuenta para comenzar",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: '#74834c' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Logo section */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/logoHenco.jpeg"
                alt="Logo - Henco"
                className="drop-shadow-2xl h-80 lg:h-96 w-auto object-contain max-w-full"
              />
            </div>
          </div>

          {/* Signup form section */}
          <div className="flex justify-center lg:justify-start">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border shadow-2xl">
              <CardHeader className="text-center pb-2 px-6 pt-6">
                <CardTitle className="text-2xl font-bold mb-1 text-gray-800">
                  Crear Cuenta
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                  Regístrate para comenzar a usar la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <SignupForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}