"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Vegan, DollarSign, Tag, Percent } from "lucide-react";
import { toast } from "sonner";

interface PriceTypeData {
  priceTypeId: string;
  markupPercent: string;
}

interface ProductFormData {
  name: string;
  type: string;
  costPerKg: string;
  priceTypes: PriceTypeData[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    costPerKg: "",
    priceTypes: [],
  });

  const handleNumericInput = (value: string, fieldName: string, priceTypeId?: string) => {
    let newValue = value;

    // Permitir solo números, puntos decimales y comas (convertir comas a puntos)
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    if (fieldName === "costPerKg") {
      setFormData({ ...formData, costPerKg: newValue });
    } else if (priceTypeId) {
      // Actualizar porcentaje de un tipo de precio específico
      const updatedPriceTypes = formData.priceTypes.map(pt =>
        pt.priceTypeId === priceTypeId
          ? { ...pt, markupPercent: newValue }
          : pt
      );
      setFormData({ ...formData, priceTypes: updatedPriceTypes });
    }
  };

  const handleNumericFocus = (fieldName: string, priceTypeId?: string) => {
    if (fieldName === "costPerKg") {
      if (formData.costPerKg === "0") {
        setFormData({ ...formData, costPerKg: "" });
      }
    } else if (priceTypeId) {
      const priceType = formData.priceTypes.find(pt => pt.priceTypeId === priceTypeId);
      if (priceType && priceType.markupPercent === "0") {
        const updatedPriceTypes = formData.priceTypes.map(pt =>
          pt.priceTypeId === priceTypeId
            ? { ...pt, markupPercent: "" }
            : pt
        );
        setFormData({ ...formData, priceTypes: updatedPriceTypes });
      }
    }
  };

  const { data: productTypes } = api.productTypes.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();

  // Inicializar tipos de precio cuando se cargan
  useState(() => {
    if (priceTypes && formData.priceTypes.length === 0) {
      const initialPriceTypes = priceTypes.map(pt => ({
        priceTypeId: pt.id,
        markupPercent: "0",
      }));
      setFormData(prev => ({ ...prev, priceTypes: initialPriceTypes }));
    }
  });

  const createMutation = api.products.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado exitosamente");
      router.push("/dashboard/productos");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.costPerKg) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Filtrar solo los tipos de precio que tienen un porcentaje configurado
    const validPriceTypes = formData.priceTypes.filter(pt =>
      pt.markupPercent && pt.markupPercent !== "0"
    );

    createMutation.mutate({
      name: formData.name,
      type: formData.type,
      costPerKg: formData.costPerKg,
      priceTypes: validPriceTypes.length > 0 ? validPriceTypes : undefined,
    });
  };

  const handleCancel = () => {
    router.push("/dashboard/productos");
  };

  const calculateFinalPrice = (costPerKg: string, markupPercent: string) => {
    const cost = parseFloat(costPerKg) || 0;
    const markup = parseFloat(markupPercent) || 0;
    const finalPrice = cost * (1 + markup / 100);
    return finalPrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 text-primary hover:text-primary hover:bg-primary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Productos
          </Button>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Vegan className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-3 drop-shadow-sm">
              Nuevo Producto
            </h1>
            <p className="text-primary/80 text-lg">
              Agrega un nuevo producto a tu inventario de dietética
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Vegan className="h-6 w-6 mr-3" />
              Información del Producto
            </h2>
          </div>
          <div className="p-8 bg-white/95">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <Vegan className="h-4 w-4 mr-2 text-primary" />
                  Nombre del Producto
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Almendras peladas"
                  className="border-primary focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  Tipo de Producto
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Selecciona un tipo de producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes?.map((productType) => (
                      <SelectItem key={productType.id} value={productType.name}>
                        {productType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!productTypes || productTypes.length === 0) && (
                  <p className="text-sm text-amber-600">
                    No hay tipos de productos disponibles.
                    <a href="/dashboard/tipos-productos" className="text-primary hover:underline ml-1">
                      Crear tipos de productos
                    </a>
                  </p>
                )}
              </div>

              {/* Cost per Kg */}
              <div className="space-y-2">
                <Label
                  htmlFor="costPerKg"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  Costo por Kilogramo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                    $
                  </span>
                  <Input
                    id="costPerKg"
                    type="text"
                    value={formData.costPerKg}
                    onChange={(e) => handleNumericInput(e.target.value, "costPerKg")}
                    onFocus={() => handleNumericFocus("costPerKg")}
                    placeholder="0.00"
                    className="pl-8 border-primary focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Ingresa el precio por kilogramo del producto
                </p>
              </div>

              {/* Price Types Section */}
              {priceTypes && priceTypes.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-6">
                    <Label className="text-gray-700 font-medium flex items-center text-lg mb-4">
                      <Percent className="h-5 w-5 mr-2 text-primary" />
                      Configuración de Precios por Tipo
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Configura el porcentaje de aumento para cada tipo de precio. Deja en 0 los tipos que no apliquen.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {priceTypes.map((priceType) => {
                      const currentPriceType = formData.priceTypes.find(pt => pt.priceTypeId === priceType.id);
                      const markupPercent = currentPriceType?.markupPercent || "0";
                      const finalPrice = calculateFinalPrice(formData.costPerKg, markupPercent);

                      return (
                        <div key={priceType.id} className="p-4 border border-primary rounded-lg bg-primary/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Label className="font-medium text-black">
                                {priceType.name}
                              </Label>
                              {priceType.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                  Por Defecto
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Precio final: <span className="font-semibold text-primary">${finalPrice}</span>
                            </div>
                          </div>
                          {priceType.description && (
                            <p className="text-sm text-gray-600 mb-3">{priceType.description}</p>
                          )}
                          <div className="relative">
                            <Input
                              type="text"
                              value={markupPercent}
                              onChange={(e) => handleNumericInput(e.target.value, "markupPercent", priceType.id)}
                              onFocus={() => handleNumericFocus("markupPercent", priceType.id)}
                              placeholder="0.00"
                              className="pr-8 border-primary focus:border-primary focus:ring-primary"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                              %
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!priceTypes || priceTypes.length === 0) && (
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-sm text-amber-700">
                    No hay tipos de precio configurados.
                    <a href="/dashboard/tipos-precio" className="text-primary hover:underline ml-1">
                      Crear tipos de precio
                    </a>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 shadow-lg"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Vegan className="h-4 w-4 mr-2" />
                      Crear Producto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-6 border-primary bg-primary/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-white rounded-full mt-1"></div>
              <div>
                <h3 className="font-semibold text-primary-foreground mb-2">
                  💡 Consejo sobre precios dinámicos
                </h3>
                <p className="text-sm text-primary-foreground">
                  Con el nuevo sistema de tipos de precio, puedes configurar diferentes porcentajes
                  para cada tipo (mayorista, minorista, promociones, etc.). Solo configura los tipos
                  que utilices para este producto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}