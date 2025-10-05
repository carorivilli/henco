/* eslint-disable */
//@ts-nocheck @typescript-eslint/no-explicit-any

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type definitions for autoTable
declare module 'jspdf-autotable' {
  interface UserOptions {
    head?: string[][];
    body?: string[][];
    startY?: number;
    theme?: string;
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    margin?: any;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}

interface Product {
  id: string;
  name: string;
  type: string;
  totalQuantityKg: string;
  costPerKg: string;
  markupPercent?: string;
  finalPrice?: string;
}

interface Mix {
  id: string;
  name: string;
  totalWeight: string;
  totalCost: string;
  markupPercent?: string;
  finalPrice?: string;
  products?: Array<{
    name: string;
  }>;
}

interface PriceType {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

interface ReportData {
  products: Product[];
  mixes: Mix[];
  priceTypes: PriceType[];
  selectedPriceType?: PriceType;
  allPriceTypes?: boolean;
}

export const generateProductsReport = async (data: ReportData): Promise<void> => {
  try {
    console.log('Starting PDF generation with data:', data);

    const doc = new jsPDF();
    const { products, mixes, priceTypes, allPriceTypes } = data;

    // Set default font to ensure compatibility
    doc.setFont('helvetica', 'normal');

    // Green color theme
    const colors = {
      primary: [116, 131, 76],    // #74834c
      secondary: [144, 158, 98],  // #909e62
      light: [200, 210, 180],     // #c8d2b4
      dark: [80, 90, 52],         // #505a34
      text: [40, 40, 40],         // #282828
      white: [255, 255, 255]      // #ffffff
    };

    let currentY = 40;

    // Header with logo and green background
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, 210, 35, 'F');

    // Load and add logo
    try {
      const logoBase64 = await loadImageAsBase64('/logoHenco.jpeg');
      doc.addImage(logoBase64, 'JPEG', 10, 5, 25, 25);
    } catch (error) {
      console.warn('Could not load logo, using text fallback:', error);
      // Fallback: white text
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('HENCO', 15, 20);
      doc.setFontSize(8);
      doc.text('Dietética Natural', 15, 26);
    }

    // Title (adjusted size to fit)
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE COMPLETO DE PRODUCTOS Y MIX', 45, 18);

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 45, 26);

    if (allPriceTypes && priceTypes && priceTypes.length > 0) {
      // Generate report for each price type
      for (let i = 0; i < priceTypes.length; i++) {
        const priceType = priceTypes[i];
        const isMayorista = priceType.name.toLowerCase().includes('mayorista');

        // Add new page for each price type (except first)
        if (i > 0) {
          doc.addPage();
          currentY = 20;
        }

        // Price type header
        doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.rect(10, currentY, 190, 12, 'F');

        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TIPO DE PRECIO: ${priceType.name.toUpperCase()}`, 15, currentY + 8);

        if (priceType.description) {
          doc.setFontSize(10);
          doc.text(`(${priceType.description})`, 15, currentY + 18);
          currentY += 25;
        } else {
          currentY += 20;
        }

        // Warning message for mayorista prices
        if (isMayorista) {
          doc.setFillColor(255, 243, 205); // Light yellow background
          doc.rect(10, currentY, 190, 22, 'F');

          // Border for the warning box
          doc.setDrawColor(255, 193, 7); // Orange border
          doc.setLineWidth(1);
          doc.rect(10, currentY, 190, 22);

          doc.setTextColor(133, 77, 14); // Dark amber text
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('ADVERTENCIA: Precio mayorista - Minimo de compra 5kg', 15, currentY + 7);

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text('- Los productos se muestran con costo y precio por 5kg', 15, currentY + 13);
          doc.text('- Solo se incluyen mix con peso total igual o mayor a 5kg', 15, currentY + 17);
          currentY += 27;
        }

        // Products section for this price type
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCTOS', 15, currentY);
        currentY += 8;

        if (products && products.length > 0) {
          const productHeaders = isMayorista
            ? [['Nombre', 'Tipo', 'Peso Total (kg)', 'Costo por 5kg', 'Aumento %', 'Precio Final (5kg)']]
            : [['Nombre', 'Tipo', 'Peso Total (kg)', 'Costo/Kg', 'Aumento %', 'Precio Final']];

          const productData = products.map(product => [
            String(product.name || ''),
            String(product.type || ''),
            String(product.totalQuantityKg || '0.000'),
            isMayorista
              ? `$${(parseFloat(product.costPerKg || '0') * 5).toFixed(2)}`
              : `$${String(product.costPerKg || '0.00')}`,
            `${String(product.markupPercent || '0')}%`,
            isMayorista
              ? `$${(parseFloat(product.finalPrice || '0') * 5).toFixed(2)}`
              : `$${String(product.finalPrice || '0.00')}`
          ]);

          autoTable(doc, {
            head: productHeaders,
            body: productData,
            startY: currentY,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
              font: 'helvetica',
            },
            headStyles: {
              fillColor: colors.primary,
              textColor: colors.white,
              fontStyle: 'bold',
              font: 'helvetica',
            },
            alternateRowStyles: {
              fillColor: colors.light,
            },
            margin: { left: 15, right: 15 },
          });

          currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 80;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text('No hay productos registrados para este tipo de precio', 15, currentY);
          currentY += 20;
        }

        // Mix section for this price type
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MIX DE PRODUCTOS', 15, currentY);
        currentY += 8;

        if (mixes && mixes.length > 0) {
          // Filter mixes for mayorista (only >= 5kg)
          const filteredMixes = isMayorista
            ? mixes.filter(mix => parseFloat(mix.totalWeight || '0') >= 5)
            : mixes;

          if (filteredMixes.length > 0) {
            const mixHeaders = [['Nombre', 'Productos', 'Peso Total (kg)', 'Costo Total', 'Aumento %', 'Precio Final']];
            const mixData = filteredMixes.map(mix => [
              String(mix.name || ''),
              String(mix.products?.map(p => p.name).join(', ') || 'Sin productos'),
              String(mix.totalWeight || '0.000'),
              `$${String(mix.totalCost || '0.00')}`,
              `${String(mix.markupPercent || '0')}%`,
              `$${String(mix.finalPrice || '0.00')}`
            ]);

            autoTable(doc, {
              head: mixHeaders,
              body: mixData,
              startY: currentY,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2,
                font: 'helvetica',
              },
              headStyles: {
                fillColor: colors.secondary,
                textColor: colors.white,
                fontStyle: 'bold',
                font: 'helvetica',
              },
              alternateRowStyles: {
                fillColor: colors.light,
              },
              margin: { left: 15, right: 15 },
            });
          } else {
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            if (isMayorista) {
              doc.text('No hay mix de 5kg o más para precio mayorista', 15, currentY);
            } else {
              doc.text('No hay mix registrados para este tipo de precio', 15, currentY);
            }
          }
        } else {
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text('No hay mix registrados para este tipo de precio', 15, currentY);
        }
      }
    } else {
      // Fallback: single price type report
      currentY = 50;

      // Products section
      if (products && products.length > 0) {
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCTOS', 15, currentY);
        currentY += 10;

        const productHeaders = [['Nombre', 'Tipo', 'Peso Total (kg)', 'Costo/Kg', 'Aumento %', 'Precio Final']];
        const productData = products.map(product => [
          String(product.name || ''),
          String(product.type || ''),
          String(product.totalQuantityKg || '0.000'),
          `$${String(product.costPerKg || '0.00')}`,
          `${String(product.markupPercent || '0')}%`,
          `$${String(product.finalPrice || '0.00')}`
        ]);

        autoTable(doc, {
          head: productHeaders,
          body: productData,
          startY: currentY,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
            font: 'helvetica',
          },
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontStyle: 'bold',
            font: 'helvetica',
          },
          alternateRowStyles: {
            fillColor: colors.light,
          },
          margin: { left: 15, right: 15 },
        });

        currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 80;
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );

      doc.text(
        'Generado por Sistema Henco - Dietética Natural',
        15,
        doc.internal.pageSize.height - 10
      );
    }

    // Download the PDF
    const fileName = `reporte-completo-henco-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Saving PDF with filename:', fileName);
    doc.save(fileName);
    console.log('PDF generation completed successfully');

  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to load image as base64
const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
};