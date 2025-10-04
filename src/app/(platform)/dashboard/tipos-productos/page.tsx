"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface ProductTypeFormData {
  name: string;
}

export default function ProductTypesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
  const [editingProductType, setEditingProductType] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState<ProductTypeFormData>({
    name: "",
  });

  const { data: productTypes, refetch } = api.productTypes.getAll.useQuery();

  const createMutation = api.productTypes.create.useMutation({
    onSuccess: () => {
      toast.success("Tipo de producto creado exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.productTypes.update.useMutation({
    onSuccess: () => {
      toast.success("Tipo de producto actualizado exitosamente");
      setIsEditOpen(false);
      setEditingProductType(null);
      setFormData({ name: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.productTypes.delete.useMutation({
    onSuccess: () => {
      toast.success("Tipo de producto eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Por favor completa el nombre");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingProductType) return;
    updateMutation.mutate({
      id: editingProductType.id,
      ...formData,
    });
  };

  const handleEdit = (productType: { id: string; name: string }) => {
    setEditingProductType(productType);
    setFormData({
      name: productType.name,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setTypeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      deleteMutation.mutate({ id: typeToDelete });
      setTypeToDelete(null);
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
                  <Tag className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-black drop-shadow-sm">Tipos de Productos</h1>
              </div>
              <p className="text-black text-lg">
                Gestiona los tipos de productos para tu dietética
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </div>
        </div>

        {/* Product Types Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Tag className="h-6 w-6 mr-3" />
              Tipos de Productos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-primary bg-primary/50">
                  <TableHead className="text-white font-semibold">Nombre</TableHead>
                  <TableHead className="text-white font-semibold">Fecha de Creación</TableHead>
                  <TableHead className="text-right text-white font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productTypes?.map((productType) => (
                  <TableRow
                    key={productType.id}
                    className="table-row-white !bg-white hover:!bg-white focus:!bg-white active:!bg-white data-[state=selected]:!bg-white"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span>{productType.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(productType.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(productType)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(productType.id)}
                          disabled={deleteMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!productTypes || productTypes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                          <Tag className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-lg mb-2">
                            No hay tipos de productos registrados
                          </p>
                          <p className="text-gray-600">
                            Comienza agregando tu primer tipo de producto
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsCreateOpen(true)}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Tipo
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="border-primary bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Crear Tipo de Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name" className="text-gray-700 font-medium">Nombre</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Frutos secos, Cereales, Legumbres..."
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creando..." : "Crear Tipo de Producto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="border-primary bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Editar Tipo de Producto</DialogTitle>
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
                  placeholder="Nombre del tipo de producto"
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleUpdate}
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Actualizando..." : "Actualizar Tipo de Producto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Product Type Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tipo de producto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El tipo de producto será eliminado permanentemente del sistema.
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