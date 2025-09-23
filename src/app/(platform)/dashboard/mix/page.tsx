"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Trash2, ShoppingCart, Blend, Leaf, Vegan, Pencil, Percent } from "lucide-react";
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

export default function MixesPage() {
  const router = useRouter();

  const handleQuantityInput = (value: string) => {
    let newValue = value;

    // Permitir solo números, puntos decimales y comas (convertir comas a puntos)
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    return newValue;
  };


  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMixConfirmOpen, setDeleteMixConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [mixToDelete, setMixToDelete] = useState<string | null>(null);
  const [selectedMix, setSelectedMix] = useState<{
    id: string;
    name: string;
    totalCost: string;
  } | null>(null);
  const [editingMix, setEditingMix] = useState<{
    id: string;
    name: string;
    totalCost: string;
  } | null>(null);
  const [productFormData, setProductFormData] = useState<ProductToMixData>({
    productId: "",
    quantityKg: "",
  });
  const [formData, setFormData] = useState<MixFormData>({
    name: "",
    productIds: [],
    priceTypes: [],
  });

  const { data: mixes, refetch: refetchMixes } = api.mixes.getAll.useQuery();
  const { data: products } = api.products.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();
  const { data: mixDetails, refetch: refetchMixDetails } = api.mixes.getById.useQuery(
    { id: selectedMix?.id || "" },
    { enabled: !!selectedMix?.id }
  );



  const updateMutation = api.mixes.update.useMutation({
    onSuccess: () => {
      toast.success("Mix actualizado exitosamente");
      setIsEditOpen(false);
      setEditingMix(null);
      const initialPriceTypes = priceTypes ? priceTypes.map(pt => ({
        priceTypeId: pt.id,
        markupPercent: "0",
      })) : [];
      setFormData({
        name: "",
        productIds: [],
        priceTypes: initialPriceTypes,
      });
      refetchMixes();
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
      refetchMixDetails();
      refetchMixes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProductMutation = api.mixes.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Cantidad actualizada");
      refetchMixDetails();
      refetchMixes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeProductMutation = api.mixes.removeProduct.useMutation({
    onSuccess: () => {
      toast.success("Producto removido del mix");
      refetchMixDetails();
      refetchMixes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.mixes.delete.useMutation({
    onSuccess: () => {
      toast.success("Mix eliminado exitosamente");
      setSelectedMix(null);
      refetchMixes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleNumericInput = (value: string, priceTypeId: string) => {
    let newValue = value;
    // Permitir solo números, puntos decimales y comas (convertir comas a puntos)
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
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

  // Cargar precios existentes cuando se abre el diálogo de edición
  useEffect(() => {
    if (isEditOpen && editingMix && mixDetails && priceTypes) {
      const updatedPriceTypes = priceTypes.map(pt => {
        const existingPrice = mixDetails.priceTypes?.find(mp => mp.priceTypeId === pt.id);
        return {
          priceTypeId: pt.id,
          markupPercent: existingPrice?.markupPercent || "0",
        };
      });

      setFormData(prev => ({
        ...prev,
        priceTypes: updatedPriceTypes,
      }));
    }
  }, [isEditOpen, editingMix, mixDetails, priceTypes]);


  const handleUpdate = () => {
    if (!editingMix) return;

    // Filtrar solo los tipos de precio que tienen un porcentaje configurado
    const validPriceTypes = formData.priceTypes.filter(pt =>
      pt.markupPercent && pt.markupPercent !== "0"
    );

    updateMutation.mutate({
      id: editingMix.id,
      name: formData.name,
      priceTypes: validPriceTypes.length > 0 ? validPriceTypes : undefined,
    });
  };

  const handleEdit = (mix: {
    id: string;
    name: string;
    totalCost: string;
  }) => {
    setEditingMix(mix);
    setSelectedMix({ id: mix.id, name: mix.name, totalCost: mix.totalCost }); // Para cargar los detalles del mix

    // Inicializar tipos de precio para edición
    // Los precios actuales se cargarán cuando mixDetails esté disponible
    const initialPriceTypes = priceTypes ? priceTypes.map(pt => ({
      priceTypeId: pt.id,
      markupPercent: "0",
    })) : [];

    setFormData({
      name: mix.name,
      productIds: [],
      priceTypes: initialPriceTypes,
    });
    setIsEditOpen(true);
  };

  const handleAddProduct = () => {
    if (!selectedMix) return;
    const quantity = parseFloat(productFormData.quantityKg) || 0;
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    addProductMutation.mutate({
      mixId: selectedMix.id,
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

  const handleDeleteMix = (id: string) => {
    setMixToDelete(id);
    setDeleteMixConfirmOpen(true);
  };

  const confirmDeleteMix = () => {
    if (mixToDelete) {
      deleteMutation.mutate({ id: mixToDelete });
      setMixToDelete(null);
      setDeleteMixConfirmOpen(false);
    }
  };


  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50/30 to-emerald-50/20 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Blend className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-green-800 drop-shadow-sm">Mix de Productos</h1>
              </div>
              <p className="text-green-700/80 text-lg">
                Crea y gestiona mezclas personalizadas de productos de tu dietética
              </p>
            </div>
            <Button
              className="shadow-lg"
              onClick={() => router.push("/dashboard/mix/crear")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Mix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Mixes */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Leaf className="h-6 w-6 mr-3" />
                Lista de Mix
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {mixes?.map((mix) => (
                  <div
                    key={mix.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMix?.id === mix.id
                        ? "bg-emerald-100 border-emerald-400 shadow-md"
                        : "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                    }`}
                    onClick={() => setSelectedMix(mix)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-emerald-900">{mix.name}</h3>
                          <p className="text-sm text-emerald-600">
                            Costo Total: <span className="font-bold">${mix.totalCost}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(mix);
                          }}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMix(mix.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!mixes || mixes.length === 0) && (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Blend className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <p className="text-emerald-800 font-medium mb-1">
                          No hay mix creados
                        </p>
                        <p className="text-emerald-600 text-sm">
                          Crea tu primera mezcla de productos
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del Mix */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Vegan className="h-6 w-6 mr-3" />
                  {selectedMix ? `Detalles: ${selectedMix.name}` : "Selecciona un Mix"}
                </h2>
                {selectedMix && (
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-white text-green-700 hover:bg-green-50">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Agregar Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-green-200 bg-white/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="text-green-800 flex items-center">
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Agregar Producto al Mix
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="product" className="text-green-700 font-medium">
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
                            <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
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
                          <Label htmlFor="quantity" className="text-green-700 font-medium">
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
                            onFocus={() => {
                              if (productFormData.quantityKg === "0") {
                                setProductFormData({
                                  ...productFormData,
                                  quantityKg: "",
                                });
                              }
                            }}
                            placeholder="0.000"
                            className="border-green-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <Button
                          onClick={handleAddProduct}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
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
                )}
              </div>
            </div>
            <div className="p-6">
              {selectedMix ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 mb-2">Resumen del Mix</h3>
                    <p className="text-sm text-emerald-700 mb-1">
                      Nombre: <span className="font-medium">{selectedMix.name}</span>
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      Costo Total: ${mixDetails?.totalCost || "0.00"}
                    </p>
                  </div>

                  {mixDetails?.products && mixDetails.products.length > 0 ? (
                    <div className="border-2 border-emerald-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-emerald-50">
                            <TableHead className="text-emerald-800 font-semibold">Producto</TableHead>
                            <TableHead className="text-emerald-800 font-semibold">Cantidad (kg)</TableHead>
                            <TableHead className="text-emerald-800 font-semibold">Costo Parcial</TableHead>
                            <TableHead className="text-emerald-800 font-semibold"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mixDetails.products.map((item) => (
                            <TableRow
                              key={item.id}
                              className="table-row-white !bg-white hover:!bg-white focus:!bg-white active:!bg-white data-[state=selected]:!bg-white"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium text-emerald-900">{item.product.name}</p>
                                    <p className="text-sm text-emerald-600">
                                      ${item.product.costPerKg}/kg
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-emerald-800 font-medium">
                                {item.quantityKg} kg
                              </TableCell>
                              <TableCell className="font-bold text-emerald-900">
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
                  ) : (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Vegan className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                          <p className="text-emerald-800 font-medium mb-1">
                            No hay productos en este mix
                          </p>
                          <p className="text-emerald-600 text-sm">
                            Agrega productos para comenzar a crear tu mezcla
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Blend className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-emerald-800 font-medium mb-1">
                        Selecciona un mix para ver sus detalles
                      </p>
                      <p className="text-emerald-600 text-sm">
                        Elige un mix de la lista para gestionar sus productos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Mix Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="border-green-200 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-green-800 flex items-center">
                <Pencil className="h-5 w-5 mr-2" />
                Editar Mix
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-700 font-medium flex items-center">
                  <Blend className="h-4 w-4 mr-2" />
                  Nombre del Mix
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mix energético, Mix proteico..."
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>


              {/* Price Types Section for Edit */}
              {priceTypes && priceTypes.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <Label className="text-gray-700 font-medium flex items-center text-lg mb-4">
                      <Percent className="h-5 w-5 mr-2" />
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
                      const totalCost = editingMix ? parseFloat(editingMix.totalCost) : 0;
                      const finalPrice = calculateFinalPrice(totalCost, markupPercent);

                      return (
                        <div key={priceType.id} className="p-4 border border-green-200 rounded-lg bg-green-50/30">
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
                            </div>
                            <div className="text-sm text-gray-600">
                              Precio final: <span className="font-semibold text-green-700">${finalPrice}</span>
                            </div>
                          </div>
                          {priceType.description && (
                            <p className="text-sm text-gray-600 mb-3">{priceType.description}</p>
                          )}
                          <div className="relative">
                            <Input
                              type="text"
                              value={markupPercent}
                              onChange={(e) => handleNumericInput(e.target.value, priceType.id)}
                              onFocus={() => handleNumericFocus(priceType.id)}
                              placeholder="0.00"
                              className="pr-8 border-green-200 focus:border-green-500 focus:ring-green-500"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">
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
                    <a href="/dashboard/tipos-precio" className="text-green-600 hover:underline ml-1">
                      Crear tipos de precio
                    </a>
                  </p>
                </div>
              )}


              {/* Edit Products Section */}
              {editingMix && (
                <div>
                  <Label className="text-gray-700 font-medium flex items-center mb-3">
                    <Vegan className="h-4 w-4 mr-2" />
                    Productos en el Mix
                  </Label>
                  <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50/30">
                    {mixDetails?.products?.map((mixProduct) => (
                      <div key={mixProduct.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{mixProduct.product.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({mixProduct.product.type})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            value={mixProduct.quantityKg}
                            onChange={(e) => {
                              const cleanedValue = handleQuantityInput(e.target.value);
                              const newQuantity = parseFloat(cleanedValue) || 0;
                              if (newQuantity > 0) {
                                updateProductMutation.mutate({
                                  id: mixProduct.id,
                                  quantityKg: newQuantity
                                });
                              }
                            }}
                            onFocus={(e) => {
                              if (e.target.value === "0" || e.target.value === "0.000") {
                                e.target.value = "";
                              }
                            }}
                            className="w-20 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600">kg</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveProduct(mixProduct.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!mixDetails?.products || mixDetails.products.length === 0) && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Este mix no tiene productos agregados
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpdate}
                className="w-full"
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
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Delete Mix Confirmation */}
        <AlertDialog open={deleteMixConfirmOpen} onOpenChange={setDeleteMixConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mix?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El mix y todos sus productos serán eliminados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteMix}
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