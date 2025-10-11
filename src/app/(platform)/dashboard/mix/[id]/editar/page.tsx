"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Trash2, ShoppingCart, Blend, Vegan, Pencil, Percent, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ProductToMixData {
  productId: string;
  quantityKg: string;
}

interface PriceTypeData {
  priceTypeId: string;
  markupPercent: string;
}

interface MixFormData {
  name: string;
  productIds: string[];
  priceTypes: PriceTypeData[];
}

export default function EditMixPage() {
  const router = useRouter();
  const params = useParams();
  const mixId = params.id as string;

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<ProductToMixData>({
    productId: "",
    quantityKg: "",
  });
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MixFormData>({
    name: "",
    productIds: [],
    priceTypes: [],
  });

  const { data: mix, refetch: refetchMix } = api.mixes.getById.useQuery(
    { id: mixId },
    { enabled: !!mixId }
  );
  const { data: products } = api.products.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();

  const handleQuantityInput = (value: string) => {
    let newValue = value;
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    return newValue;
  };

  const updateMutation = api.mixes.update.useMutation({
    onSuccess: () => {
      toast.success("Mix actualizado exitosamente");
      router.push("/dashboard/mix");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addProductMutation = api.mixes.addProduct.useMutation({
    onSuccess: () => {
      toast.success("Producto agregado al mix");
      setIsAddProductOpen(false);
      setProductFormData({ productId: "", quantityKg: "" });
      refetchMix();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProductMutation = api.mixes.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Cantidad actualizada");
      refetchMix();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeProductMutation = api.mixes.removeProduct.useMutation({
    onSuccess: () => {
      toast.success("Producto removido del mix");
      refetchMix();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleNumericInput = (value: string, priceTypeId: string) => {
    let newValue = value;
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    const updatedPriceTypes = formData.priceTypes.map(pt =>
      pt.priceTypeId === priceTypeId ? { ...pt, markupPercent: newValue } : pt
    );

    setFormData({ ...formData, priceTypes: updatedPriceTypes });
  };

  const handleNumericFocus = (priceTypeId: string) => {
    const priceType = formData.priceTypes.find(pt => pt.priceTypeId === priceTypeId);
    if (priceType && priceType.markupPercent === "0") {
      const updatedPriceTypes = formData.priceTypes.map(pt =>
        pt.priceTypeId === priceTypeId ? { ...pt, markupPercent: "" } : pt
      );
      setFormData({ ...formData, priceTypes: updatedPriceTypes });
    }
  };

  const calculateFinalPrice = (totalCost: number, markupPercent: string): string => {
    const markup = parseFloat(markupPercent) || 0;
    const finalPrice = totalCost * (1 + markup / 100);
    return finalPrice.toFixed(2);
  };

  const calculateTotalWeight = (): number => {
    if (!mix?.products) return 0;
    return mix.products.reduce((total, product) => {
      return total + parseFloat(product.quantityKg || "0");
    }, 0);
  };

  const handleQuantityEdit = (itemId: string, value: string) => {
    const cleanedValue = handleQuantityInput(value);
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: cleanedValue
    }));
  };

  const handleQuantityBlur = (itemId: string, originalValue: string) => {
    const editedValue = editingQuantities[itemId];
    if (editedValue === undefined) return;

    if (editedValue === "") {
      // Si está vacío, restaurar el valor original
      setEditingQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      return;
    }

    const newQuantity = parseFloat(editedValue);
    if (newQuantity > 0 && editedValue !== originalValue) {
      updateProductMutation.mutate({
        id: itemId,
        quantityKg: newQuantity
      });
    }

    // Limpiar el estado de edición
    setEditingQuantities(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const getDisplayValue = (itemId: string, originalValue: string): string => {
    return editingQuantities[itemId] !== undefined ? editingQuantities[itemId] : originalValue;
  };

  // Cargar datos del mix cuando se obtiene la información
  useEffect(() => {
    if (mix && priceTypes && formData.priceTypes.length === 0) {
      // Solo inicializar si no hay priceTypes cargados (primera carga)
      const updatedPriceTypes = priceTypes.map(pt => {
        const existingPrice = mix.priceTypes?.find(mp => mp.priceTypeId === pt.id);
        return {
          priceTypeId: pt.id,
          markupPercent: existingPrice?.markupPercent || "0",
        };
      });

      setFormData({
        name: mix.name,
        productIds: [],
        priceTypes: updatedPriceTypes,
      });
    }
  }, [mix, priceTypes, formData.priceTypes.length]);

  // Detectar y agregar nuevos tipos de precio sin sobrescribir los existentes
  useEffect(() => {
    if (priceTypes && formData.priceTypes.length > 0) {
      const currentPriceTypeIds = new Set(formData.priceTypes.map(pt => pt.priceTypeId));
      const newPriceTypes = priceTypes.filter(pt => !currentPriceTypeIds.has(pt.id));

      if (newPriceTypes.length > 0) {
        const additionalPriceTypes = newPriceTypes.map(pt => ({
          priceTypeId: pt.id,
          markupPercent: "0",
        }));

        setFormData(prev => ({
          ...prev,
          priceTypes: [...prev.priceTypes, ...additionalPriceTypes],
        }));
      }
    }
  }, [priceTypes, formData.priceTypes]);

  // Resetear precios mayoristas cuando el peso es menor a 5kg
  useEffect(() => {
    if (mix && priceTypes && formData.priceTypes.length > 0) {
      const totalWeight = mix.products ? mix.products.reduce((total, product) => {
        return total + parseFloat(product.quantityKg || "0");
      }, 0) : 0;

      if (totalWeight < 5) {
        const updatedPriceTypes = formData.priceTypes.map(pt => {
          const priceType = priceTypes.find(p => p.id === pt.priceTypeId);
          const isMayorista = priceType?.name.toLowerCase().includes('mayorista');

          if (isMayorista && pt.markupPercent !== "0") {
            return { ...pt, markupPercent: "0" };
          }
          return pt;
        });

        const hasChanges = updatedPriceTypes.some((pt, index) =>
          pt.markupPercent !== formData.priceTypes[index]?.markupPercent
        );

        if (hasChanges) {
          setFormData(prev => ({
            ...prev,
            priceTypes: updatedPriceTypes,
          }));
        }
      }
    }
  }, [mix?.products, priceTypes, formData.priceTypes]);

  const handleUpdate = () => {
    if (!mix) return;

    const totalWeight = calculateTotalWeight();

    const validPriceTypes = formData.priceTypes.filter(pt => {
      if (!pt.markupPercent || pt.markupPercent === "0") return false;

      const priceType = priceTypes?.find(p => p.id === pt.priceTypeId);
      const isMayorista = priceType?.name.toLowerCase().includes('mayorista');

      if (isMayorista && totalWeight < 5) {
        return false;
      }

      return true;
    });

    updateMutation.mutate({
      id: mix.id,
      name: formData.name,
      priceTypes: validPriceTypes.length > 0 ? validPriceTypes : undefined,
    });
  };

  const handleAddProduct = () => {
    const quantity = parseFloat(productFormData.quantityKg) || 0;
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    addProductMutation.mutate({
      mixId: mixId,
      productId: productFormData.productId,
      quantityKg: quantity,
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setItemToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const confirmRemoveProduct = () => {
    if (itemToDelete) {
      removeProductMutation.mutate({ id: itemToDelete });
      setItemToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  if (!mix) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando mix...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-4">
            <SidebarTrigger className="md:hidden -ml-1" />
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/mix")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs md:text-sm"
              size="sm"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Volver a Mix</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/logoHencoIcono.png"
                    alt="Henco Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black drop-shadow-sm">Editar Mix</h1>
              </div>
              <p className="text-black text-sm md:text-base lg:text-lg ml-10 md:ml-13 lg:ml-15">
                Edita {mix.name} y gestiona sus productos y precios
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Información del Mix y Configuración */}
          <div className="space-y-6">
            {/* Información Básica */}
            <Card className="p-6 border-primary bg-white/95 backdrop-blur-sm">
              <div className="mb-4">
                <Label className="text-primary font-medium flex items-center text-lg mb-4">
                  <Blend className="h-5 w-5 mr-2" />
                  Información del Mix
                </Label>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Nombre del Mix
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Mix energético, Mix proteico..."
                    className="border-primary focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="p-4 bg-gradient-to-r from-primary to-primary rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Resumen</h3>
                  <p className="text-sm text-white/90 mb-1">
                    Peso Total: <span className="font-medium">{calculateTotalWeight().toFixed(3)} kg</span>
                  </p>
                  <p className="text-2xl font-bold text-white">
                    Costo Total: ${mix.totalCost}
                  </p>
                </div>
              </div>
            </Card>

            {/* Configuración de Precios */}
            {priceTypes && priceTypes.length > 0 && (
              <Card className="p-6 border-primary bg-white/95 backdrop-blur-sm">
                <div className="mb-4">
                  <Label className="text-primary font-medium flex items-center text-lg mb-4">
                    <Percent className="h-5 w-5 mr-2" />
                    Configuración de Precios por Tipo
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Configura el porcentaje de aumento para cada tipo de precio. Deja en 0 los tipos que no apliquen.
                  </p>
                </div>

                {/* Warning for mayorista pricing when weight < 5kg */}
                {(() => {
                  const totalWeight = calculateTotalWeight();
                  const hasMayorista = priceTypes.some(pt => pt.name.toLowerCase().includes('mayorista'));

                  if (totalWeight < 5 && hasMayorista) {
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-600">⚠️</span>
                          <div>
                            <p className="text-sm text-amber-700 font-medium">
                              Advertencia: El peso total del mix es {totalWeight.toFixed(3)} kg.
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              Los precios mayoristas requieren un mínimo de 5 kg y han sido deshabilitados.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="space-y-4">
                  {priceTypes.map((priceType) => {
                    const currentPriceType = formData.priceTypes.find(pt => pt.priceTypeId === priceType.id);
                    const markupPercent = currentPriceType?.markupPercent || "0";
                    const totalCost = parseFloat(mix.totalCost);
                    const finalPrice = calculateFinalPrice(totalCost, markupPercent);

                    const totalWeight = calculateTotalWeight();
                    const isMayorista = priceType.name.toLowerCase().includes('mayorista');
                    const isDisabled = isMayorista && totalWeight < 5;

                    return (
                      <div key={priceType.id} className={`p-4 border rounded-lg ${isDisabled ? 'bg-gray-50 opacity-60' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Label className="font-medium text-gray-800">
                              {priceType.name}
                            </Label>
                            {priceType.isDefault && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                Por Defecto
                              </span>
                            )}
                            {isDisabled && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                Peso mínimo 5kg
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
                            className={`pr-8 ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'border-primary focus:border-primary focus:ring-primary'}`}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                            %
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Botones de Acción */}
            <Card className="p-6 border-primary bg-white/95 backdrop-blur-sm">
              <div className="flex gap-4">
                <Button
                  onClick={handleUpdate}
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Actualizar Mix
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/mix")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>

          {/* Productos del Mix */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary px-4 md:px-6 py-3 md:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
                  <Vegan className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Productos en el Mix
                </h2>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-white text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto text-xs md:text-sm">
                      <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-primary bg-white/95 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle className="text-primary flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Agregar Producto al Mix
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product" className="text-primary font-medium">
                          Producto
                        </Label>
                        <Select
                          value={productFormData.productId}
                          onValueChange={(value) =>
                            setProductFormData({
                              ...productFormData,
                              productId: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} (${product.costPerKg}/kg)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity" className="text-primary font-medium">
                          Cantidad (kg)
                        </Label>
                        <Input
                          id="quantity"
                          type="text"
                          value={productFormData.quantityKg}
                          onChange={(e) => {
                            const cleanedValue = handleQuantityInput(e.target.value);
                            setProductFormData({
                              ...productFormData,
                              quantityKg: cleanedValue,
                            });
                          }}
                          onFocus={(e) => {
                            e.target.dataset.originalValue = e.target.value;
                            if (e.target.value === "0" || e.target.value === "0.000") {
                              e.target.select();
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === "") {
                              setProductFormData({
                                ...productFormData,
                                quantityKg: e.target.dataset.originalValue || "0",
                              });
                            }
                          }}
                          placeholder="0.000"
                          className="border-primary focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <Button
                        onClick={handleAddProduct}
                        className="w-full bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary"
                        disabled={addProductMutation.isPending}
                      >
                        {addProductMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Agregando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Agregar Producto
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {mix.products && mix.products.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block border-2 border-primary/30 rounded-lg overflow-hidden">
                    <Table>
                    <TableHeader>
                      <TableRow className="bg-primary">
                        <TableHead className="text-white font-semibold">Producto</TableHead>
                        <TableHead className="text-white font-semibold">Cantidad (kg)</TableHead>
                        <TableHead className="text-white font-semibold">Costo Parcial</TableHead>
                        <TableHead className="text-white font-semibold"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mix.products.map((item) => (
                        <TableRow
                          key={item.id}
                          className="table-row-white !bg-white hover:!bg-white focus:!bg-white active:!bg-white data-[state=selected]:!bg-white"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <div>
                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                  ${item.product.costPerKg}/kg
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-800 font-medium">
                            <Input
                              type="text"
                              value={getDisplayValue(item.id, item.quantityKg)}
                              onChange={(e) => handleQuantityEdit(item.id, e.target.value)}
                              onFocus={(e) => {
                                e.target.dataset.originalValue = item.quantityKg;
                                if (e.target.value === "0" || e.target.value === "0.000") {
                                  e.target.select();
                                }
                              }}
                              onBlur={() => handleQuantityBlur(item.id, item.quantityKg)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-24 text-sm border-gray-200 focus:border-primary focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="font-bold text-gray-900">
                            ${item.partialCost}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProduct(item.id)}
                              disabled={removeProductMutation.isPending}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {mix.products.map((item) => (
                      <Card key={item.id} className="p-3 border border-primary/30">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-1.5 mb-1">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                              </div>
                              <p className="text-xs text-gray-600">
                                ${item.product.costPerKg}/kg
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-200">
                            <div className="col-span-2">
                              <p className="text-gray-600 mb-1">Cantidad (kg)</p>
                              <Input
                                type="text"
                                value={getDisplayValue(item.id, item.quantityKg)}
                                onChange={(e) => handleQuantityEdit(item.id, e.target.value)}
                                onFocus={(e) => {
                                  e.target.dataset.originalValue = item.quantityKg;
                                  if (e.target.value === "0" || e.target.value === "0.000") {
                                    e.target.select();
                                  }
                                }}
                                onBlur={() => handleQuantityBlur(item.id, item.quantityKg)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-full text-xs h-8 border-gray-200 focus:border-primary focus:ring-primary"
                              />
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Costo</p>
                              <p className="font-bold text-gray-900 text-sm">${item.partialCost}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProduct(item.id)}
                              disabled={removeProductMutation.isPending}
                              className="border-red-300 text-red-700 hover:bg-red-50 w-full text-xs h-7"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <Vegan className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium mb-1">
                        No hay productos en este mix
                      </p>
                      <p className="text-gray-600 text-sm">
                        Agrega productos para comenzar a crear tu mezcla
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Product Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar producto del mix?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El producto será removido del mix permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveProduct}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}