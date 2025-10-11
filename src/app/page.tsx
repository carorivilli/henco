import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, TrendingUp, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/logoHencoIcono.png"
                  alt="Henco Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-primary">Henco</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-sm md:text-base">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm md:text-base">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Gestiona tu dietética de forma{" "}
                  <span className="text-primary">inteligente</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  Control total de inventario, precios dinámicos y creación de mix personalizados.
                  La herramienta perfecta para tu negocio.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative px-4 md:px-8 lg:px-0">
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] max-w-md mx-auto lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-3xl transform rotate-3"></div>
                <div className="relative h-full bg-white rounded-3xl shadow-2xl p-2 md:p-3 border-2 border-primary/10 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src="/landing.jpg"
                      alt="Henco Dashboard Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 md:py-20 border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Funcionalidades diseñadas específicamente para dietéticas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl transition-all duration-300 border border-primary/10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Gestión de Productos
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Control completo de tu inventario con costos y precios por kilogramo
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl transition-all duration-300 border border-primary/10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Mix Personalizados
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Crea mezclas únicas combinando productos con cálculo automático de precios
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl transition-all duration-300 border border-primary/10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Precios Dinámicos
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Configura múltiples tipos de precio (mayorista, minorista, etc.) con aumentos personalizados
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl transition-all duration-300 border border-primary/10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Reportes PDF
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Genera listas de precios profesionales para compartir con tus clientes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-primary to-primary/80">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                ¿Listo para transformar tu dietética?
              </h2>
              <p className="text-lg md:text-xl text-white/90">
                Únete hoy y descubre cómo Henco puede simplificar la gestión de tu negocio
              </p>
              
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Section - Henco Info */}
            <div className="space-y-4 text-center lg:text-left lg:col-span-2">
              <div className="flex items-center space-x-3 justify-center lg:justify-start">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logoHencoIcono.png"
                    alt="Henco Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">Henco</span>
              </div>
              <p className="text-white/80 max-w-md mx-auto lg:mx-0">
                Sistema de gestión integral para dietéticas. Control de inventario, precios y productos.
              </p>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-white/60">
                  © {new Date().getFullYear()} Henco. Todos los derechos reservados.
                </p>
              </div>
            </div>

            {/* Right Section - IMPULSA Branding */}
            <div className="space-y-4 border-l-0 lg:border-l-2 border-white/20 pl-0 lg:pl-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/20">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-white rounded-lg p-1.5">
                      <Image
                        src="/logoImpulsa.png"
                        alt="Logo IMPULSA"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-white/70 font-medium">
                        Desarrollado por
                      </p>
                      <p className="text-xl font-bold text-white">
                        IMPULSA
                      </p>
                    </div>
                  </div>
                  <div className="w-full border-t border-white/20 pt-4">
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-white/70">Contacto</p>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-white">
                          Rodrigo Alcoholado
                        </p>
                        <a
                          href="tel:+542614194014"
                          className="text-sm text-white/80 hover:text-white transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>📱</span>
                          <span>+54 9 2614 194014</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
