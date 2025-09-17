import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/15 rounded-full blur-2xl"></div>
      </div>

      {/* Floating nutrition icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <div className="w-3 h-3 bg-primary-foreground/30 rounded-full"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-1000">
          <div className="w-2 h-2 bg-primary-foreground/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-pulse delay-2000">
          <div className="w-2.5 h-2.5 bg-primary-foreground/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-pulse delay-500">
          <div className="w-2 h-2 bg-primary-foreground/30 rounded-full"></div>
        </div>
      </div>

      <Card className="w-full max-w-md mx-auto relative bg-card backdrop-blur-sm border shadow-2xl sm:bg-card/90">
        <CardHeader className="text-center pb-2 px-6 pt-4">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Logo - Dietética Profesional"
                className="drop-shadow-lg h-40 w-auto object-contain max-w-full"
              />
            </div>
          </div>

          <CardTitle className="text-xl font-bold mb-1">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}