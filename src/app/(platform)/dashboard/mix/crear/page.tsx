"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Blend, Vegan, Percent, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface PriceTypeData {
  priceTypeId: string;
  markupPercent: string;
}

interface ProductInMix {
  productId: string;
  name: string;
  type: string;
  costPerKg: string;
  quantityKg: string;
  partialCost: string;
}

interface MixFormData {
  name: string;
  products: ProductInMix[];
  priceTypes: PriceTypeData[];
}

export default function CreateMixPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MixFormData>({
    name: "",
    products: [],
    priceTypes: [],
  });

  const { data: products } = api.products.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();

  // Inicializar tipos de precio cuando se cargan
  useEffect(() => {
    if (priceTypes && formData.priceTypes.length === 0) {
      const initialPriceTypes = priceTypes.map(pt => ({
        priceTypeId: pt.id,
        markupPercent: "0",
      }));
      setFormData(prev => ({ ...prev, priceTypes: initialPriceTypes }));
    }
  }, [priceTypes, formData.priceTypes.length]);

  // Resetear precio mayorista cuando el peso cambia y se vuelve insuficiente
  useEffect(() => {
    if (priceTypes && formData.priceTypes.length > 0) {
      const currentTotalWeight = calculateTotalWeight();
      const updatedPriceTypes = formData.priceTypes.map(pt => {
        const priceType = priceTypes.find(p => p.id === pt.priceTypeId);
        const isMayorista = priceType?.name.toLowerCase().includes('mayorista');
        const shouldReset = isMayorista && currentTotalWeight < 5 && pt.markupPercent !== "0";

        return shouldReset ? { ...pt, markupPercent: "0" } : pt;
      });

      // Solo actualizar si hay cambios
      const hasChanges = updatedPriceTypes.some((pt, index) =>
        pt.markupPercent !== formData.priceTypes[index]?.markupPercent
      );

      if (hasChanges) {
        setFormData(prev => ({ ...prev, priceTypes: updatedPriceTypes }));
      }
    }
  }, [formData.products, priceTypes]);

  const handleNumericInput = (value: string, priceTypeId?: string) => {
    let newValue = value;

    // Permitir solo números, puntos decimales y comas (convertir comas a puntos)
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    if (priceTypeId) {
      // Verificar si es mayorista y tiene peso insuficiente
      const priceType = priceTypes?.find(p => p.id === priceTypeId);
      const isMayorista = priceType?.name.toLowerCase().includes('mayorista');
      const currentTotalWeight = calculateTotalWeight();
      const isDisabled = isMayorista && currentTotalWeight < 5;

      // Si está deshabilitado, no permitir cambios
      if (isDisabled) {
        return;
      }

      // Actualizar porcentaje de un tipo de precio específico
      const updatedPriceTypes = formData.priceTypes.map(pt =>
        pt.priceTypeId === priceTypeId
          ? { ...pt, markupPercent: newValue }
          : pt
      );
      setFormData({ ...formData, priceTypes: updatedPriceTypes });
    }
  };

  const handleNumericFocus = (priceTypeId?: string) => {
    if (priceTypeId) {
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

  const handleQuantityChange = (productId: string, quantity: string) => {
    const cleanQuantity = quantity.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const updatedProducts = formData.products.map(product => {
      if (product.productId === productId) {
        const qty = parseFloat(cleanQuantity) || 0;
        const costPerKg = parseFloat(product.costPerKg) || 0;
        const partialCost = (qty * costPerKg).toFixed(2);
        return {
          ...product,
          quantityKg: cleanQuantity,
          partialCost,
        };
      }
      return product;
    });
    setFormData({ ...formData, products: updatedProducts });
  };

  const addProduct = (product: { id: string; name: string; type: string; costPerKg: string }) => {
    const isAlreadyAdded = formData.products.some(p => p.productId === product.id);
    if (isAlreadyAdded) {
      toast.error("Este producto ya está agregado al mix");
      return;
    }

    const newProduct: ProductInMix = {
      productId: product.id,
      name: product.name,
      type: product.type,
      costPerKg: product.costPerKg,
      quantityKg: "1",
      partialCost: product.costPerKg,
    };

    setFormData({
      ...formData,
      products: [...formData.products, newProduct],
    });
  };

  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.productId !== productId),
    });
  };

  const calculateTotalCost = () => {
    return formData.products.reduce((total, product) => {
      return total + parseFloat(product.partialCost || "0");
    }, 0);
  };

  const calculateTotalWeight = () => {
    return formData.products.reduce((total, product) => {
      return total + parseFloat(product.quantityKg || "0");
    }, 0);
  };

  const calculateFinalPrice = (totalCost: number, markupPercent: string) => {
    const markup = parseFloat(markupPercent) || 0;
    const finalPrice = totalCost * (1 + markup / 100);
    return finalPrice.toFixed(2);
  };

  const createMutation = api.mixes.createWithQuantities.useMutation({
    onSuccess: () => {
      toast.success("Mix creado exitosamente");
      router.push("/dashboard/mix");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("El nombre del mix es requerido");
      return;
    }
    if (formData.products.length === 0) {
      toast.error("Debe agregar al menos un producto al mix");
      return;
    }

    // Crear el mix con productos y cantidades específicas
    const products = formData.products.map(p => ({
      productId: p.productId,
      quantityKg: p.quantityKg,
    }));

    // Filtrar solo los tipos de precio que tienen un porcentaje configurado y que no sean mayorista con peso insuficiente
    const validPriceTypes = formData.priceTypes.filter(pt => {
      if (!pt.markupPercent || pt.markupPercent === "0") return false;

      // Verificar si es mayorista y tiene peso insuficiente
      const priceType = priceTypes?.find(p => p.id === pt.priceTypeId);
      const isMayorista = priceType?.name.toLowerCase().includes('mayorista');
      const hasInsufficientWeight = isMayorista && totalWeight < 5;

      return !hasInsufficientWeight;
    });

    createMutation.mutate({
      name: formData.name,
      products,
      priceTypes: validPriceTypes.length > 0 ? validPriceTypes : undefined,
    });
  };

  const handleCancel = () => {
    router.push("/dashboard/mix");
  };

  const totalCost = calculateTotalCost();
  const totalWeight = calculateTotalWeight();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 text-primary hover:text-primary hover:bg-primary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mix
          </Button>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Blend className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-3 drop-shadow-sm">
              Nuevo Mix
            </h1>
            <p className="text-primary/80 text-lg">
              Crea una nueva mezcla personalizada de productos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Blend className="h-6 w-6 mr-3" />
                Información Básica
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center">
                  <Blend className="h-4 w-4 mr-2 text-primary" />
                  Nombre del Mix
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mix energético, Mix proteico..."
                  className="border-primary focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Selección de Productos */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Vegan className="h-6 w-6 mr-3" />
                Productos Disponibles
              </h2>
            </div>
            <div className="p-8">
              <div className="grid gap-4">
                {products?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-primary rounded-lg bg-primary/30">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-800">{product.name}</span>
                        <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                          {product.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Costo: ${product.costPerKg}/kg
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="ml-4"
                      disabled={formData.products.some(p => p.productId === product.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {formData.products.some(p => p.productId === product.id) ? "Agregado" : "Agregar"}
                    </Button>
                  </div>
                ))}
                {(!products || products.length === 0) && (
                  <p className="text-gray-600 text-center py-8">
                    No hay productos disponibles.
                    <a href="/dashboard/productos/crear" className="text-primary hover:underline ml-1">
                      Crear productos
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Productos en el Mix */}
          {formData.products.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-orange-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Blend className="h-6 w-6 mr-3" />
                  Productos en el Mix
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {formData.products.map((product) => (
                    <div key={product.productId} className="flex items-center space-x-4 p-4 border border-amber-200 rounded-lg bg-amber-50/30">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{product.name}</span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                            {product.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">${product.costPerKg}/kg</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">Cantidad (kg):</Label>
                        <Input
                          type="text"
                          value={product.quantityKg}
                          onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                          onFocus={(e) => {
                            e.target.dataset.originalValue = e.target.value;
                            if (e.target.value === "0" || e.target.value === "0.000" || e.target.value === "1") {
                              e.target.select();
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === "") {
                              handleQuantityChange(product.productId, e.target.dataset.originalValue || "1");
                            }
                          }}
                          className="w-24 text-center border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                          placeholder="1.0"
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Costo parcial:</p>
                        <p className="font-semibold text-amber-700">${product.partialCost}</p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.productId)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Costo Total:</span>
                      <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuración de Precios */}
          {priceTypes && priceTypes.length > 0 && formData.products.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Percent className="h-6 w-6 mr-3" />
                  Configuración de Precios por Tipo
                </h2>
              </div>
              <div className="p-8">
                <p className="text-gray-600 mb-6">
                  Configura el porcentaje de aumento para cada tipo de precio. Deja en 0 los tipos que no apliquen.
                </p>

                <div className="grid gap-6">
                  {priceTypes.map((priceType) => {
                    const currentPriceType = formData.priceTypes.find(pt => pt.priceTypeId === priceType.id);
                    const markupPercent = currentPriceType?.markupPercent || "0";
                    const finalPrice = calculateFinalPrice(totalCost, markupPercent);
                    const isMayorista = priceType.name.toLowerCase().includes('mayorista');
                    const isDisabled = isMayorista && totalWeight < 5;

                    return (
                      <div key={priceType.id} className={`p-6 border rounded-lg ${isDisabled ? 'border-gray-300 bg-gray-50/30' : 'border-green-200 bg-green-50/30'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Label className="font-medium text-gray-800 text-lg">
                              {priceType.name}
                            </Label>
                            {priceType.isDefault && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                Por Defecto
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Precio final:</p>
                            <p className="text-xl font-bold text-green-700">${finalPrice}</p>
                          </div>
                        </div>

                        {priceType.description && (
                          <p className="text-sm text-gray-600 mb-4">{priceType.description}</p>
                        )}

                        {isDisabled && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-amber-600">⚠️</span>
                              <p className="text-sm text-amber-700 font-medium">
                                Este tipo de precio requiere un peso mínimo de 5kg. Peso actual: {totalWeight.toFixed(3)}kg
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <Label className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>Porcentaje de aumento:</Label>
                          <div className="relative flex-1 max-w-xs">
                            <Input
                              type="text"
                              value={isDisabled ? "0" : markupPercent}
                              onChange={(e) => !isDisabled && handleNumericInput(e.target.value, priceType.id)}
                              onFocus={(e) => {
                                if (!isDisabled) {
                                  e.target.dataset.originalValue = e.target.value;
                                  if (e.target.value === "0" || e.target.value === "0.00") {
                                    e.target.select();
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                if (!isDisabled && e.target.value === "") {
                                  const originalValue = e.target.dataset.originalValue || "0";
                                  handleNumericInput(originalValue, priceType.id);
                                }
                              }}
                              placeholder="0.00"
                              disabled={isDisabled}
                              className={`pr-8 ${isDisabled ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-green-200 focus:border-green-500 focus:ring-green-500'}`}
                            />
                            <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 font-medium ${isDisabled ? 'text-gray-500' : 'text-green-600'}`}>
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

          {/* Botones de Acción */}
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
              disabled={createMutation.isPending || formData.products.length === 0}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Blend className="h-4 w-4 mr-2" />
                  Crear Mix
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-6 border-primary bg-primary/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full mt-1"></div>
              <div>
                <h3 className="font-semibold text-primary-foreground mb-2">
                  💡 Consejos para crear mix
                </h3>
                <ul className="text-sm text-primary-foreground space-y-1">
                  <li>• Ajusta las cantidades de cada producto según tus necesidades</li>
                  <li>• El costo total se calcula automáticamente basado en las cantidades</li>
                  <li>• Configura diferentes porcentajes para cada tipo de precio</li>
                  <li>• Los precios finales se actualizan en tiempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}