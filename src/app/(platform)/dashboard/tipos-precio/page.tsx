"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, DollarSign, Star, Percent } from "lucide-react";
import { toast } from "sonner";

interface PriceTypeFormData {
  name: string;
  description: string;
  isDefault: boolean;
}

export default function PriceTypesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [priceTypeToDelete, setPriceTypeToDelete] = useState<string | null>(null);
  const [editingPriceType, setEditingPriceType] = useState<{
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
  } | null>(null);
  const [formData, setFormData] = useState<PriceTypeFormData>({
    name: "",
    description: "",
    isDefault: false,
  });

  const { data: priceTypes, refetch } = api.priceTypes.getAll.useQuery();

  const createMutation = api.priceTypes.create.useMutation({
    onSuccess: () => {
      toast.success("Tipo de precio creado exitosamente");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", isDefault: false });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.priceTypes.update.useMutation({
    onSuccess: () => {
      toast.success("Tipo de precio actualizado exitosamente");
      setIsEditOpen(false);
      setEditingPriceType(null);
      setFormData({ name: "", description: "", isDefault: false });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.priceTypes.delete.useMutation({
    onSuccess: () => {
      toast.success("Tipo de precio eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setDefaultMutation = api.priceTypes.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Tipo de precio por defecto actualizado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingPriceType) return;
    updateMutation.mutate({
      id: editingPriceType.id,
      ...formData,
    });
  };

  const handleEdit = (priceType: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
  }) => {
    setEditingPriceType(priceType);
    setFormData({
      name: priceType.name,
      description: priceType.description || "",
      isDefault: priceType.isDefault,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setPriceTypeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (priceTypeToDelete) {
      deleteMutation.mutate({ id: priceTypeToDelete });
      setPriceTypeToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-white p-6">
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
                <h1 className="text-4xl font-bold text-black drop-shadow-sm">Tipos de Precio</h1>
              </div>
              <p className="text-black text-lg">
                Gestiona los diferentes tipos de precio para productos y mixes
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Tipo de Precio
                </Button>
              </DialogTrigger>
              <DialogContent className="border-primary bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-primary flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Crear Nuevo Tipo de Precio
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-primary font-medium">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Mayorista, Minorista, Promo..."
                      className="border-primary focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-primary font-medium">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del tipo de precio (opcional)"
                      className="border-primary focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDefault: checked as boolean })
                      }
                    />
                    <Label htmlFor="isDefault" className="text-primary font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Tipo de precio por defecto
                    </Label>
                  </div>
                  <Button
                    onClick={handleCreate}
                    className="w-full bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Tipo de Precio
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Price Types Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Percent className="h-6 w-6 mr-3" />
              Tipos de Precio Configurados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-primary bg-primary/50">
                  <TableHead className="text-white font-semibold">Nombre</TableHead>
                  <TableHead className="text-white font-semibold">Descripción</TableHead>
                  <TableHead className="text-white font-semibold">Estado</TableHead>
                  <TableHead className="text-white font-semibold">Fecha de Creación</TableHead>
                  <TableHead className="text-right text-white font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceTypes?.map((priceType) => (
                  <TableRow
                    key={priceType.id}
                    className="table-row-white !bg-white hover:!bg-white focus:!bg-white active:!bg-white data-[state=selected]:!bg-white"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span>{priceType.name}</span>
                        {priceType.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {priceType.description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      {priceType.isDefault ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Por Defecto
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          Activo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(priceType.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!priceType.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(priceType.id)}
                            disabled={setDefaultMutation.isPending}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(priceType)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(priceType.id)}
                          disabled={deleteMutation.isPending || priceType.isDefault}
                          className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!priceTypes || priceTypes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                          <DollarSign className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-lg mb-2">
                            No hay tipos de precio registrados
                          </p>
                          <p className="text-gray-600">
                            Comienza creando tu primer tipo de precio
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsCreateOpen(true)}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Tipo de Precio
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
              <DialogTitle className="text-primary text-xl">Editar Tipo de Precio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-700 font-medium">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del tipo de precio"
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-gray-700 font-medium">Descripción</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del tipo de precio (opcional)"
                  className="border-primary focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <Label htmlFor="edit-isDefault" className="text-gray-700 font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Tipo de precio por defecto
                </Label>
              </div>
              <Button
                onClick={handleUpdate}
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Actualizando..." : "Actualizar Tipo de Precio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tipo de precio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El tipo de precio será eliminado permanentemente del sistema
                y todos los precios asociados a productos y mixes también serán eliminados.
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