import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en tu cuenta",
};

export default function LoginPage() {
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

          {/* Login form section */}
          <div className="flex justify-center lg:justify-start">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border shadow-2xl">
              <CardHeader className="text-center pb-2 px-6 pt-6">
                <CardTitle className="text-2xl font-bold mb-1 text-gray-800">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                  Accede a tu cuenta para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* IMPULSA Footer - Fixed bottom right */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative w-12 h-12">
                <Image
                  src="/logoImpulsa.png"
                  alt="Logo IMPULSA"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-700 font-semibold text-sm">
                Desarrollado por IMPULSA
              </p>
            </div>

            <div className="border-t border-gray-200 w-full pt-2">
              <div className="flex flex-col items-center space-y-0.5 text-center">
                <p className="text-gray-600 text-xs font-medium">
                  Contacto
                </p>
                <p className="text-gray-800 font-semibold text-xs">
                  Rodrigo Alcoholado
                </p>
                <p className="text-gray-600 text-xs">
                  Tel: +54 9 2614 194014
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}