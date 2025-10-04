"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Pencil, Trash2, Vegan, Percent } from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  type: string;
  costPerKg: string;
  retailMarkupPercent: string;
  wholesaleMarkupPercent: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleNumericInput = (value: string, fieldName: keyof ProductFormData) => {
    let newValue = value;

    // Permitir solo números, puntos decimales y comas (convertir comas a puntos)
    newValue = newValue.replace(/,/g, '.');
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    setFormData({ ...formData, [fieldName]: newValue });
  };

  const handleNumericFocus = (fieldName: keyof ProductFormData) => {
    const currentValue = formData[fieldName] as string;
    if (currentValue === "0") {
      setFormData({ ...formData, [fieldName]: "" });
    }
  };
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    type: string;
    costPerKg: string;
    retailMarkupPercent: string;
    wholesaleMarkupPercent: string;
  } | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    costPerKg: "",
    retailMarkupPercent: "",
    wholesaleMarkupPercent: "",
  });

  const { data: products, refetch } = api.products.getAll.useQuery();
  const { data: productTypes } = api.productTypes.getAll.useQuery();


  const updateMutation = api.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      setIsEditOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", type: "", costPerKg: "", retailMarkupPercent: "", wholesaleMarkupPercent: "" });
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
    if (!editingProduct) return;
    updateMutation.mutate({
      id: editingProduct.id,
      ...formData,
    });
  };

  const handleEdit = (product: { id: string; name: string; type: string; costPerKg: string; [key: string]: unknown }) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      type: product.type,
      costPerKg: product.costPerKg,
      retailMarkupPercent: "0",
      wholesaleMarkupPercent: "0",
    });
    setFormData({
      name: product.name,
      type: product.type,
      costPerKg: product.costPerKg,
      retailMarkupPercent: "0",
      wholesaleMarkupPercent: "0",
    });
    setIsEditOpen(true);
  };

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
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Vegan className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-black drop-shadow-sm">Productos</h1>
              </div>
              <p className="text-black text-lg">
                Gestiona el inventario de productos de tu dietética
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              className="shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Vegan className="h-6 w-6 mr-3" />
              Inventario de Productos
            </h2>
          </div>
          <div className="overflow-x-auto">
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
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="border-primary bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Editar Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

              <div>
                <Label htmlFor="edit-retailMarkupPercent" className="text-gray-700 font-medium flex items-center">
                  <Percent className="h-4 w-4 mr-2" />
                  Porcentaje de Aumento Minorista
                </Label>
                <div className="relative">
                  <Input
                    id="edit-retailMarkupPercent"
                    type="text"
                    value={formData.retailMarkupPercent}
                    onChange={(e) => handleNumericInput(e.target.value, "retailMarkupPercent")}
                    onFocus={() => handleNumericFocus("retailMarkupPercent")}
                    placeholder="0.00"
                    className="pr-8 border-primary focus:border-primary focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                    %
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-wholesaleMarkupPercent" className="text-gray-700 font-medium flex items-center">
                  <Percent className="h-4 w-4 mr-2" />
                  Porcentaje de Aumento Mayorista
                </Label>
                <div className="relative">
                  <Input
                    id="edit-wholesaleMarkupPercent"
                    type="text"
                    value={formData.wholesaleMarkupPercent}
                    onChange={(e) => handleNumericInput(e.target.value, "wholesaleMarkupPercent")}
                    onFocus={() => handleNumericFocus("wholesaleMarkupPercent")}
                    placeholder="0.00"
                    className="pr-8 border-primary focus:border-primary focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                    %
                  </span>
                </div>
              </div>
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