"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2, Vegan, Percent } from "lucide-react";
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

export default function ProductsPage() {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    costPerKg: "",
    priceTypes: [],
  });

  const { data: products, refetch } = api.products.getAll.useQuery();
  const { data: productTypes } = api.productTypes.getAll.useQuery();
  const { data: priceTypes } = api.priceTypes.getAll.useQuery();
  const { data: editingProduct } = api.products.getById.useQuery(
    { id: editingProductId! },
    { enabled: !!editingProductId }
  );

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
    if (fieldName === "costPerKg" && formData.costPerKg === "0") {
      setFormData({ ...formData, costPerKg: "" });
    } else if (priceTypeId) {
      const priceType = formData.priceTypes.find(pt => pt.priceTypeId === priceTypeId);
      if (priceType && (priceType.markupPercent === "0" || priceType.markupPercent === "0.00")) {
        const updatedPriceTypes = formData.priceTypes.map(pt =>
          pt.priceTypeId === priceTypeId
            ? { ...pt, markupPercent: "" }
            : pt
        );
        setFormData({ ...formData, priceTypes: updatedPriceTypes });
      }
    }
  };


  const updateMutation = api.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      setIsEditOpen(false);
      setEditingProductId(null);
      setFormData({ name: "", type: "", costPerKg: "", priceTypes: [] });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateNew = () => {
    router.push("/dashboard/productos/crear");
  };

  const handleUpdate = () => {
    if (!editingProductId) return;

    // Filtrar solo los tipos de precio que tienen un porcentaje configurado
    const validPriceTypes = formData.priceTypes.filter(pt =>
      pt.markupPercent && pt.markupPercent !== "0"
    );

    updateMutation.mutate({
      id: editingProductId,
      name: formData.name,
      type: formData.type,
      costPerKg: formData.costPerKg,
      priceTypes: validPriceTypes.length > 0 ? validPriceTypes : undefined,
    });
  };

  const handleEdit = (product: { id: string }) => {
    setEditingProductId(product.id);
    setIsEditOpen(true);
  };

  // Cargar datos del producto cuando se obtiene la información
  useEffect(() => {
    if (editingProduct && priceTypes && formData.priceTypes.length === 0) {
      // Solo inicializar si no hay priceTypes cargados (primera carga)
      const updatedPriceTypes = priceTypes.map(pt => {
        const existingPrice = editingProduct.priceTypes?.find((ep: { priceTypeId: string }) => ep.priceTypeId === pt.id);
        return {
          priceTypeId: pt.id,
          markupPercent: existingPrice?.markupPercent || "0",
        };
      });

      setFormData({
        name: editingProduct.name,
        type: editingProduct.type,
        costPerKg: editingProduct.costPerKg,
        priceTypes: updatedPriceTypes,
      });
    }
  }, [editingProduct, priceTypes, formData.priceTypes.length]);

  // Detectar y agregar nuevos tipos de precio sin sobrescribir los existentes
  useEffect(() => {
    if (priceTypes && formData.priceTypes.length > 0 && isEditOpen) {
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
  }, [priceTypes, formData.priceTypes, isEditOpen]);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate({ id: productToDelete });
      setProductToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      // Resetear estado cuando se cierra el diálogo
      setEditingProductId(null);
      setFormData({ name: "", type: "", costPerKg: "", priceTypes: [] });
    }
  };

  return (
    <div
      className="min-h-screen bg-white p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                <SidebarTrigger className="md:hidden -ml-1" />
                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/logoHencoIcono.png"
                    alt="Henco Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black drop-shadow-sm">Productos</h1>
              </div>
              <p className="text-black text-sm md:text-base lg:text-lg ml-10 md:ml-13 lg:ml-15">
                Gestiona el inventario de productos de tu dietética
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              className="shadow-lg w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-4 md:px-6 py-3 md:py-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
              <Vegan className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
              Inventario de Productos
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-primary bg-primary/50">
                  <TableHead className="text-white font-semibold">Nombre</TableHead>
                  <TableHead className="text-white font-semibold">Tipo</TableHead>
                  <TableHead className="text-white font-semibold">Costo por Kg</TableHead>
                  <TableHead className="text-white font-semibold">Fecha de Creación</TableHead>
                  <TableHead className="text-right text-white font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow
                    key={product.id}
                    className="table-row-white !bg-white hover:!bg-white focus:!bg-white active:!bg-white data-[state=selected]:!bg-white"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {product.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      ${product.costPerKg}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!products || products.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                          <Vegan className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-lg mb-2">
                            No hay productos registrados
                          </p>
                          <p className="text-gray-600">
                            Comienza agregando tu primer producto a la dietética
                          </p>
                        </div>
                        <Button
                          onClick={handleCreateNew}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Producto
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3">
            {products && products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <Card key={product.id} className="p-4 border-2 border-primary/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                            {product.type}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
                        <div>
                          <p className="text-gray-600 mb-0.5">Costo por Kg</p>
                          <p className="font-semibold text-gray-900">${product.costPerKg}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-0.5">Creado</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(product.createdAt).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 py-12">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Vegan className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 font-semibold mb-1">
                    No hay productos registrados
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    Comienza agregando tu primer producto a la dietética
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Producto
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="border-primary bg-white/95 backdrop-blur-sm max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary text-lg md:text-xl">Editar Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-700 font-medium">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre del producto"
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="edit-type" className="text-gray-700 font-medium">Tipo</Label>
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
              </div>
              <div>
                <Label htmlFor="edit-costPerKg" className="text-gray-700 font-medium">Costo por Kg</Label>
                <Input
                  id="edit-costPerKg"
                  type="text"
                  value={formData.costPerKg}
                  onChange={(e) => handleNumericInput(e.target.value, "costPerKg")}
                  onFocus={() => handleNumericFocus("costPerKg")}
                  placeholder="0.00"
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Price Types Section */}
              {priceTypes && priceTypes.length > 0 && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <Label className="text-gray-700 font-medium flex items-center text-base">
                    <Percent className="h-5 w-5 mr-2 text-primary" />
                    Configuración de Precios por Tipo
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Configura el porcentaje de aumento para cada tipo de precio. Deja en 0 los tipos que no apliquen.
                  </p>

                  <div className="grid gap-3">
                    {priceTypes.map((priceType) => {
                      const currentPriceType = formData.priceTypes.find(pt => pt.priceTypeId === priceType.id);
                      const markupPercent = currentPriceType?.markupPercent || "0";
                      const cost = parseFloat(formData.costPerKg) || 0;
                      const markup = parseFloat(markupPercent) || 0;
                      const finalPrice = (cost * (1 + markup / 100)).toFixed(2);

                      return (
                        <div key={priceType.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Label className="font-medium text-gray-800 text-sm">
                                {priceType.name}
                              </Label>
                              {priceType.isDefault && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                  Por Defecto
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              Precio: <span className="font-semibold text-primary">${finalPrice}</span>
                            </div>
                          </div>
                          {priceType.description && (
                            <p className="text-xs text-gray-600 mb-2">{priceType.description}</p>
                          )}
                          <div className="relative">
                            <Input
                              type="text"
                              value={markupPercent}
                              onChange={(e) => handleNumericInput(e.target.value, "markupPercent", priceType.id)}
                              onFocus={(e) => {
                                e.target.dataset.originalValue = e.target.value;
                                if (e.target.value === "0" || e.target.value === "0.00") {
                                  e.target.select();
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  const originalValue = e.target.dataset.originalValue || "0";
                                  handleNumericInput(originalValue, "markupPercent", priceType.id);
                                }
                              }}
                              placeholder="0.00"
                              className="pr-8 text-sm border-primary focus:border-primary focus:ring-primary"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium text-sm">
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
                <div className="p-3 border border-amber-200 rounded-lg bg-amber-50/30">
                  <p className="text-xs text-amber-700">
                    No hay tipos de precio configurados.
                    <a href="/dashboard/tipos-precio" className="text-primary hover:underline ml-1">
                      Crear tipos de precio
                    </a>
                  </p>
                </div>
              )}
              <Button
                onClick={handleUpdate}
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Actualizando..." : "Actualizar Producto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
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