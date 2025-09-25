"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartBar, Package, Blend, TrendingUp, DollarSign, Star } from "lucide-react";

type FilterType = "products" | "mixes";

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>("products");
  const [selectedPriceTypeId, setSelectedPriceTypeId] = useState<string>("");

  const { data: priceTypes } = api.priceTypes.getAll.useQuery();
  const { data: products } = api.products.getAllWithPrices.useQuery({
    priceTypeId: selectedPriceTypeId || undefined,
  });
  const { data: mixes } = api.mixes.getAllWithPrices.useQuery({
    priceTypeId: selectedPriceTypeId || undefined,
  });

  // Establecer tipo de precio por defecto cuando se cargan los datos
  useEffect(() => {
    if (priceTypes && !selectedPriceTypeId) {
      const defaultPriceType = priceTypes.find(pt => pt.isDefault);
      if (defaultPriceType) {
        setSelectedPriceTypeId(defaultPriceType.id);
      } else if (priceTypes.length > 0) {
        setSelectedPriceTypeId(priceTypes[0].id);
      }
    }
  }, [priceTypes, selectedPriceTypeId]);

  const selectedPriceType = priceTypes?.find(pt => pt.id === selectedPriceTypeId);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBar className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-primary drop-shadow-sm">
                  Dashboard
                </h1>
              </div>
              <p className="text-black text-lg">
                Productos y mix disponibles con precios dinámicos
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <Card className="p-4 border-primary bg-white/90 backdrop-blur-sm">
            <div className="flex items-center space-x-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-primary font-medium">Mostrar:</label>
                <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                  <SelectTrigger className="w-48 border-primary focus:border-primary focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Productos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mixes">
                      <div className="flex items-center space-x-2">
                        <Blend className="h-4 w-4" />
                        <span>Mix</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-primary font-medium">Tipo de Precio:</label>
                <Select
                  value={selectedPriceTypeId}
                  onValueChange={setSelectedPriceTypeId}
                >
                  <SelectTrigger className="w-48 border-primary focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Seleccionar tipo de precio" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTypes?.map((priceType) => (
                      <SelectItem key={priceType.id} value={priceType.id}>
                        <div className="flex items-center space-x-2">
                          {priceType.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          <span>{priceType.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!priceTypes || priceTypes.length === 0) && (
                <div className="text-amber-600 text-sm">
                  No hay tipos de precio configurados.
                  <a href="/dashboard/tipos-precio" className="text-primary hover:underline ml-1">
                    Crear tipos de precio
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              {filter === "products" ? (
                <>
                  <Package className="h-6 w-6 mr-3" />
                  Reporte de Productos
                </>
              ) : (
                <>
                  <Blend className="h-6 w-6 mr-3" />
                  Reporte de Mix
                </>
              )}
              {selectedPriceType && (
                <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {selectedPriceType.name}
                  {selectedPriceType.isDefault && " (Por Defecto)"}
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            {filter === "products" ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-primary bg-primary/50">
                    <TableHead className="text-white font-semibold">Nombre</TableHead>
                    <TableHead className="text-white font-semibold">Tipo</TableHead>
                    <TableHead className="text-white font-semibold">Costo/Kg</TableHead>
                    <TableHead className="text-white font-semibold">Aumento</TableHead>
                    <TableHead className="text-white font-semibold">Precio Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id} className="table-row-white">
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
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-1" />
                          {product.costPerKg}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                          {selectedPriceTypeId && 'markupPercent' in product ? product.markupPercent : '0'}%
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-black-800">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-1" />
                          {selectedPriceTypeId && 'finalPrice' in product ? product.finalPrice : '0.00'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!products || products.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-lg mb-2">
                              No hay productos registrados
                            </p>
                            <p className="text-gray-600">
                              Comienza agregando productos para ver el reporte
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-primary bg-primary/50">
                    <TableHead className="text-white font-semibold">Nombre</TableHead>
                    <TableHead className="text-white font-semibold">Descripción</TableHead>
                    <TableHead className="text-white font-semibold">Costo Total</TableHead>
                    <TableHead className="text-white font-semibold">Markup %</TableHead>
                    <TableHead className="text-white font-semibold">Precio Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mixes?.map((mix) => (
                    <TableRow key={mix.id} className="table-row-white">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>{mix.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="max-w-xs">
                          {'products' in mix && mix.products && mix.products.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mix.products.map((product, index) => (
                                <span
                                  key={product.id}
                                  className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                                >
                                  {product.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic text-sm">Sin productos</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-1" />
                          {mix.totalCost}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                          {selectedPriceTypeId && 'markupPercent' in mix ? mix.markupPercent : '0'}%
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-purple-800">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-purple-600 mr-1" />
                          {selectedPriceTypeId && 'finalPrice' in mix ? mix.finalPrice : '0.00'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!mixes || mixes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                            <Blend className="h-10 w-10 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-lg mb-2">
                              No hay mix registrados
                            </p>
                            <p className="text-gray-600">
                              Comienza creando mix para ver el reporte
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}