"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Trash2, ShoppingCart, Blend, Leaf, Vegan, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ProductToMixData {
  productId: string;
  quantityKg: string;
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
  const [productFormData, setProductFormData] = useState<ProductToMixData>({
    productId: "",
    quantityKg: "",
  });

  const { data: mixes, refetch: refetchMixes } = api.mixes.getAll.useQuery();
  const { data: products } = api.products.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();
  const { data: mixDetails, refetch: refetchMixDetails } = api.mixes.getById.useQuery(
    { id: selectedMix?.id || "" },
    { enabled: !!selectedMix?.id }
  );





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
      className="min-h-screen bg-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/logoHencoIcono.png"
                    alt="Henco Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-4xl font-bold text-black drop-shadow-sm">Mix de Productos</h1>
              </div>
              <p className="text-black text-lg">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
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
                        ? "border-primary shadow-md"
                        : "border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMix(mix)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mix.name}</h3>
                          <p className="text-sm text-gray-600">
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
                            router.push(`/dashboard/mix/${mix.id}/editar`);
                          }}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <Blend className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium mb-1">
                          No hay mix creados
                        </p>
                        <p className="text-gray-600 text-sm">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Vegan className="h-6 w-6 mr-3" />
                  {selectedMix ? `Detalles: ${selectedMix.name}` : "Selecciona un Mix"}
                </h2>
                {selectedMix && (
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-white text-primary hover:bg-primary hover:text-primary-foreground">
                        <ShoppingCart className="h-4 w-4 mr-2" />
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
                )}
              </div>
            </div>
            <div className="p-6">
              {selectedMix ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-primary to-primary rounded-lg border border-primary">
                    <h3 className="font-semibold text-white mb-2">Resumen del Mix</h3>
                    <p className="text-sm text-white/90 mb-1">
                      Nombre: <span className="font-medium">{selectedMix.name}</span>
                    </p>
                    <p className="text-2xl font-bold text-white">
                      Costo Total: ${mixDetails?.totalCost || "0.00"}
                    </p>
                  </div>

                  {mixDetails?.products && mixDetails.products.length > 0 ? (
                    <div className="border-2 border-primary/30 rounded-lg overflow-hidden">
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
                          {mixDetails.products.map((item) => (
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
                                {item.quantityKg} kg
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
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <Blend className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium mb-1">
                        Selecciona un mix para ver sus detalles
                      </p>
                      <p className="text-gray-600 text-sm">
                        Elige un mix de la lista para gestionar sus productos
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