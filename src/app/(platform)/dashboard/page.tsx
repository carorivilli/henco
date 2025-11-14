"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChartBar, Package, Blend, TrendingUp, DollarSign, Star, Download } from "lucide-react";

type FilterType = "products" | "mixes";

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>("products");
  const [selectedPriceTypeId, setSelectedPriceTypeId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("all");

  const { data: priceTypes } = api.priceTypes.getAll.useQuery();
  const { data: productNames } = api.products.getProductNames.useQuery();

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

  // Reset product name filter when switching to mixes view
  useEffect(() => {
    if (filter === "mixes") {
      setSelectedProductName("all");
    }
  }, [filter]);

  const selectedPriceType = priceTypes?.find(pt => pt.id === selectedPriceTypeId);
  const isMayorista = selectedPriceType?.name.toLowerCase().includes('mayorista');

  const handleDownloadReport = async () => {
    try {
      console.log('Starting PDF download...', {
        products: products?.length,
        mixes: mixes?.length,
        priceTypes: priceTypes?.length,
        selectedPriceType: selectedPriceType?.name
      });

      // Dynamically import the PDF generator to avoid SSR issues
      const { generateProductsReport } = await import('@/lib/pdf-generator');

      // Generate complete report with all price types
      await generateProductsReport({
        products: products || [],
        mixes: mixes || [],
        priceTypes: priceTypes || [],
        allPriceTypes: true,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta nuevamente.`);
    }
  };

  const handleDownloadFilteredReport = async () => {
    try {
      if (!selectedPriceType) {
        alert('Por favor selecciona un tipo de precio primero');
        return;
      }

      console.log('Starting filtered PDF download...', {
        products: products?.length,
        mixes: mixes?.length,
        selectedPriceType: selectedPriceType?.name
      });

      // Dynamically import the PDF generator to avoid SSR issues
      const { generateProductsReport } = await import('@/lib/pdf-generator');

      // Generate filtered report with only selected price type
      await generateProductsReport({
        products: filteredProducts || [],
        mixes: mixes || [],
        priceTypes: [selectedPriceType],
        allPriceTypes: true,
      });
    } catch (error) {
      console.error('Error generating filtered PDF:', error);
      alert(`Error al generar el reporte filtrado: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta nuevamente.`);
    }
  };

  const { data: products } = api.products.getAllWithPrices.useQuery({
    priceTypeId: selectedPriceTypeId || undefined,
  });
  const { data: mixes } = api.mixes.getAllWithPrices.useQuery({
    priceTypeId: selectedPriceTypeId || undefined,
    priceTypeName: selectedPriceType?.name || undefined,
  });

  // Filter products by selected product name
  const filteredProducts = products?.filter(product =>
    selectedProductName === "all" || product.name === selectedProductName
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black drop-shadow-sm">
                  Dashboard
                </h1>
              </div>
              <p className="text-black text-sm md:text-base lg:text-lg ml-10 md:ml-13 lg:ml-15">
                Productos y mix disponibles con precios dinámicos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={handleDownloadReport}
                className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                disabled={(!products || products.length === 0) && (!mixes || mixes.length === 0)}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Descargar lista de precios</span>
                <span className="sm:hidden">Lista de precios</span>
              </Button>
              <Button
                onClick={handleDownloadFilteredReport}
                className="shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full sm:w-auto"
                disabled={!selectedPriceTypeId || ((!products || products.length === 0) && (!mixes || mixes.length === 0))}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Descargar lista filtrada</span>
                <span className="sm:hidden">Lista filtrada</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-4 md:mb-6">
          <Card className="p-3 md:p-4 border-primary bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <label className="text-primary font-medium text-sm md:text-base whitespace-nowrap">Mostrar:</label>
                <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48 border-primary focus:border-primary focus:ring-primary">
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <label className="text-primary font-medium text-sm md:text-base whitespace-nowrap">Tipo de Precio:</label>
                <Select
                  value={selectedPriceTypeId}
                  onValueChange={setSelectedPriceTypeId}
                >
                  <SelectTrigger className="w-full sm:w-48 border-primary focus:border-primary focus:ring-primary">
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

              {filter === "products" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                  <label className="text-primary font-medium text-sm md:text-base whitespace-nowrap">Producto:</label>
                  <Select
                    value={selectedProductName}
                    onValueChange={setSelectedProductName}
                  >
                    <SelectTrigger className="w-full sm:w-48 border-primary focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los productos</SelectItem>
                      {productNames?.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(!priceTypes || priceTypes.length === 0) && (
                <div className="text-amber-600 text-xs md:text-sm w-full md:w-auto">
                  No hay tipos de precio configurados.
                  <a href="/dashboard/tipos-precio" className="text-primary hover:underline ml-1">
                    Crear tipos de precio
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Mensaje de advertencia para mayorista */}
        {isMayorista && (
          <div className="mb-4 md:mb-6">
            <div className="p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-amber-700 font-medium">
                    Advertencia: El mínimo de compra para precio mayorista es 5 kg.
                  </p>
                  {filter === "products" && (
                    <p className="text-xs md:text-sm text-amber-700 mt-1">
                      • Los costos y precios se muestran por la cantidad mínima (5kg).
                    </p>
                  )}
                  {filter === "mixes" && (
                    <p className="text-xs md:text-sm text-amber-700 mt-1">
                      • Solo se muestran mix con peso total igual o mayor a 5kg.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-4 md:px-6 py-3 md:py-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="flex items-center">
                {filter === "products" ? (
                  <>
                    <Package className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                    Reporte de Productos
                  </>
                ) : (
                  <>
                    <Blend className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                    Reporte de Mix
                  </>
                )}
              </span>
              {selectedPriceType && (
                <span className="px-2 md:px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm w-fit">
                  {selectedPriceType.name}
                  {selectedPriceType.isDefault && " (Por Defecto)"}
                </span>
              )}
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            {filter === "products" ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-primary bg-primary/50">
                    <TableHead className="text-white font-semibold">Nombre</TableHead>
                    <TableHead className="text-white font-semibold">Tipo</TableHead>
                    <TableHead className="text-white font-semibold">Peso Total (kg)</TableHead>
                    <TableHead className="text-white font-semibold">
                      {isMayorista ? 'Costo por 5kg' : 'Costo/Kg'}
                    </TableHead>
                    <TableHead className="text-white font-semibold">Aumento</TableHead>
                    <TableHead className="text-white font-semibold">
                      {isMayorista ? 'Precio Final (5kg)' : 'Precio Final'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
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
                          <Package className="h-4 w-4 text-blue-600 mr-1" />
                          {'totalQuantityKg' in product ? product.totalQuantityKg : '0.000'} kg
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-1" />
                          {isMayorista ? (parseFloat(product.costPerKg) * 5).toFixed(2) : product.costPerKg}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
{selectedPriceTypeId && 'markupPercent' in product ? String(product.markupPercent) : '0'}%
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-black-800">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-1" />
{selectedPriceTypeId && 'finalPrice' in product ? String(product.finalPrice) : '0.00'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredProducts || filteredProducts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-lg mb-2">
                              {selectedProductName !== "all" ? "No se encontró este producto" : "No hay productos registrados"}
                            </p>
                            <p className="text-gray-600">
                              {selectedProductName !== "all" ? "Selecciona otro producto" : "Comienza agregando productos para ver el reporte"}
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
                    <TableHead className="text-white font-semibold">Peso Total (kg)</TableHead>
                    <TableHead className="text-white font-semibold">Costo Total</TableHead>
                    <TableHead className="text-white font-semibold">Aumento %</TableHead>
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
                              {mix.products.map((product) => (
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
                          <Package className="h-4 w-4 text-blue-600 mr-1" />
                          {'totalWeight' in mix ? mix.totalWeight : '0.000'} kg
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
{selectedPriceTypeId && 'markupPercent' in mix ? String(mix.markupPercent) : '0'}%
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-purple-800">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-purple-600 mr-1" />
{selectedPriceTypeId && 'finalPrice' in mix ? String(mix.finalPrice) : '0.00'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!mixes || mixes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
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

          {/* Mobile Card View */}
          <div className="md:hidden p-3">
            {filter === "products" ? (
              <>
                {filteredProducts && filteredProducts.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="p-4 border-2 border-primary/30">
                        <div className="space-y-2">
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

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Peso Total</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <Package className="h-3 w-3 text-blue-600 mr-1" />
                                {'totalQuantityKg' in product ? product.totalQuantityKg : '0.000'} kg
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">{isMayorista ? 'Costo 5kg' : 'Costo/Kg'}</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <DollarSign className="h-3 w-3 text-primary mr-1" />
                                {isMayorista ? (parseFloat(product.costPerKg) * 5).toFixed(2) : product.costPerKg}
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Aumento</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                                {selectedPriceTypeId && 'markupPercent' in product ? String(product.markupPercent) : '0'}%
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Precio Final</p>
                              <p className="font-bold text-primary flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {selectedPriceTypeId && 'finalPrice' in product ? String(product.finalPrice) : '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 py-12">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 font-semibold mb-1">
                        {selectedProductName !== "all" ? "No se encontró este producto" : "No hay productos registrados"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedProductName !== "all" ? "Selecciona otro producto" : "Comienza agregando productos para ver el reporte"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {mixes && mixes.length > 0 ? (
                  <div className="space-y-3">
                    {mixes.map((mix) => (
                      <Card key={mix.id} className="p-4 border-2 border-orange-200">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                <h3 className="font-semibold text-gray-900 text-sm">{mix.name}</h3>
                              </div>
                              {('products' in mix && mix.products && mix.products.length > 0) && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {mix.products.map((product) => (
                                    <span
                                      key={product.id}
                                      className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                                    >
                                      {product.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Peso Total</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <Package className="h-3 w-3 text-blue-600 mr-1" />
                                {'totalWeight' in mix ? mix.totalWeight : '0.000'} kg
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Costo Total</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <DollarSign className="h-3 w-3 text-primary mr-1" />
                                {mix.totalCost}
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Aumento</p>
                              <p className="font-semibold text-gray-900 flex items-center">
                                <TrendingUp className="h-3 w-3 text-purple-600 mr-1" />
                                {selectedPriceTypeId && 'markupPercent' in mix ? String(mix.markupPercent) : '0'}%
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-gray-600 mb-0.5">Precio Final</p>
                              <p className="font-bold text-purple-800 flex items-center">
                                <DollarSign className="h-3 w-3 text-purple-600 mr-1" />
                                {selectedPriceTypeId && 'finalPrice' in mix ? String(mix.finalPrice) : '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Blend className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 font-semibold mb-1">
                        No hay mix registrados
                      </p>
                      <p className="text-gray-600 text-sm">
                        Comienza creando mix para ver el reporte
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}