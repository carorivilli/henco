"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Image as ImageIcon, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
  userEmail?: string;
}

export function ProfileDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}: ProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    image: "",
  });

  const { data: user, refetch } = api.users.getById.useQuery(
    { id: userId },
    { enabled: open && !!userId }
  );

  const updateMutation = api.users.update.useMutation({
    onSuccess: (data) => {
      toast.success("Perfil actualizado exitosamente");
      refetch();
      // Recargar la página para actualizar la sesión
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Cargar datos del usuario cuando se obtienen
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("El email es requerido");
      return;
    }

    updateMutation.mutate({
      id: userId,
      name: formData.name,
      email: formData.email,
      image: formData.image || null,
    });
  };

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Resetear a los valores originales cuando se cierra
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          image: user.image || "",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="border-primary bg-white/95 backdrop-blur-sm max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg md:text-xl flex items-center">
            <User className="h-5 w-5 md:h-6 md:w-6 mr-2" />
            Mi Perfil
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Administra tu información personal y preferencias de cuenta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Información de la cuenta */}
          {user && (
            <div className="p-3 md:p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs md:text-sm font-medium text-gray-700">
                  Información de la cuenta
                </p>
              </div>
              <div className="space-y-1 text-xs md:text-sm text-gray-600">
                <p>
                  <span className="font-medium">Miembro desde:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Email verificado:</span>{" "}
                  {user.emailVerified ? (
                    <span className="text-green-600">Sí ✓</span>
                  ) : (
                    <span className="text-amber-600">No verificado</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium flex items-center text-sm md:text-base">
              <User className="h-4 w-4 mr-1.5 text-primary" />
              Nombre
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre completo"
              className="border-primary focus:border-primary focus:ring-primary text-sm md:text-base"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium flex items-center text-sm md:text-base">
              <Mail className="h-4 w-4 mr-1.5 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className="border-primary focus:border-primary focus:ring-primary text-sm md:text-base"
              required
            />
            <p className="text-xs text-gray-500">
              Este email se usará para iniciar sesión
            </p>
          </div>

          {/* URL de imagen (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-700 font-medium flex items-center text-sm md:text-base">
              <ImageIcon className="h-4 w-4 mr-1.5 text-primary" />
              URL de imagen de perfil (opcional)
            </Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://ejemplo.com/tu-foto.jpg"
              className="border-primary focus:border-primary focus:ring-primary text-sm md:text-base"
            />
            <p className="text-xs text-gray-500">
              Proporciona una URL de imagen para tu foto de perfil
            </p>
          </div>

          {/* Vista previa de avatar */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium text-sm md:text-base">
              Vista previa del perfil
            </Label>
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Avatar className="w-12 h-12 md:w-16 md:h-16 border-2 border-primary/20">
                <AvatarImage
                  src={formData.image || undefined}
                  alt={formData.name || "Usuario"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg md:text-2xl font-semibold">
                  {formData.name
                    ? formData.name.charAt(0).toUpperCase()
                    : formData.email
                    ? formData.email.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                  {formData.name || "Usuario"}
                </p>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {formData.email || "email@ejemplo.com"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
