/**
 * Servicio de Exportación a Excel, PDF, Impresión y WhatsApp
 * Opera 100% en el dispositivo del usuario sin requerir servidores externos.
 */

import { Livestock, HistorialClinicoItem, ReporteDiario, UPPConfig } from '../types/livestock';

/**
 * Descarga un archivo en el navegador
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exportar Inventario de Ganado a formato Excel (.csv compatible con Excel con BOM UTF-8)
 */
export function exportInventoryToExcel(animals: Livestock[], upp: UPPConfig) {
  const headers = [
    'Arete Oficial (SINIGA)',
    'Arete Visual',
    'Nombre / Apodo',
    'Género',
    'Categoría',
    'Raza',
    'Color',
    'Fecha Nacimiento',
    'Peso Actual (kg)',
    'Estado',
    'Estado Reproductivo',
    'Fecha Inseminación / Monta',
    'Fecha Probable Parto',
    'Arete Madre',
    'Arete Padre',
    'Ubicación / Predio',
    'Potrero',
    'Notas / Observaciones',
  ];

  const rows = animals.map((a) => [
    `"${a.arete}"`,
    `"${a.areteVisual || ''}"`,
    `"${a.nombre || ''}"`,
    `"${a.genero}"`,
    `"${a.categoria}"`,
    `"${a.raza}"`,
    `"${a.color || ''}"`,
    `"${a.fechaNacimiento || ''}"`,
    a.pesoKg,
    `"${a.estado}"`,
    `"${a.estadoReproductivo}"`,
    `"${a.fechaInseminacionOMonta || ''}"`,
    `"${a.fechaProbableParto || ''}"`,
    `"${a.madreArete || ''}"`,
    `"${a.padreArete || ''}"`,
    `"${a.ubicacion || ''}"`,
    `"${a.potrero || ''}"`,
    `"${(a.notas || '').replace(/"/g, '""')}"`,
  ]);

  // Cabecera institucional con datos de la UPP
  const titleBlock = [
    `"INVENTARIO GENERAL DE GANADO BOVINO"`,
    `"UPP: ${upp.clave} - Productor: ${upp.nombreProductor}"`,
    `"Rancho / Predio: ${upp.nombreRancho}"`,
    `"Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')}"`,
    `""`,
  ].join('\r\n');

  const csvContent =
    '\uFEFF' + // UTF-8 BOM para que Excel abra acentos y caracteres especiales directamente
    titleBlock +
    '\r\n' +
    headers.join(';') +
    '\r\n' +
    rows.map((r) => r.join(';')).join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Inventario_Ganadero_UPP_${upp.clave.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Exportar Historial Clínico y Vacunación a Excel
 */
export function exportClinicalToExcel(items: HistorialClinicoItem[], upp: UPPConfig) {
  const headers = [
    'Arete Animal',
    'Tipo',
    'Medicamento / Biológico',
    'Dosis',
    'Vía de Administración',
    'Fecha de Aplicación',
    'Próxima Dosis / Refuerzo',
    'Lote / Laboratorio',
    'Días Retiro Carne',
    'Días Retiro Leche',
    'Aplicado Por / Veterinario',
    'Estado',
    'Observaciones',
  ];

  const rows = items.map((i) => [
    `"${i.arete}"`,
    `"${i.tipo}"`,
    `"${i.medicamento}"`,
    `"${i.dosis}"`,
    `"${i.via}"`,
    `"${i.fechaAplicacion}"`,
    `"${i.fechaProximaDosis || ''}"`,
    `"${i.loteLaboratorio || ''}"`,
    i.diasRetiroCarne || 0,
    i.diasRetiroLeche || 0,
    `"${i.veterinario || ''}"`,
    i.completado ? '"Completado"' : '"Pendiente"',
    `"${(i.notas || '').replace(/"/g, '""')}"`,
  ]);

  const titleBlock = [
    `"REGISTRO CLÍNICO Y CONTROL SANITARIO DE VACUNACIÓN"`,
    `"UPP: ${upp.clave} - Rancho: ${upp.nombreRancho}"`,
    `"Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')}"`,
    `""`,
  ].join('\r\n');

  const csvContent =
    '\uFEFF' +
    titleBlock +
    '\r\n' +
    headers.join(';') +
    '\r\n' +
    rows.map((r) => r.join(';')).join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Historial_Clinico_UPP_${upp.clave.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Imprimir Inventario o Reporte usando el diálogo nativo de impresión
 */
export function printCurrentView() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Generar texto de resumen para compartir por WhatsApp
 */
export function generateWhatsAppReportSummary(reporte: ReporteDiario): string {
  const lines = [
    `🐄 *REPORTE DIARIO DE ACTIVIDAD GANADERA*`,
    `📍 *UPP:* ${reporte.uppClave} | *Rancho:* ${reporte.ubicacion}`,
    `👤 *Responsable:* ${reporte.responsable}`,
    `📅 *Fecha:* ${reporte.fecha} | *Hora:* ${reporte.horaCierre}`,
    `---------------------------------`,
    `📊 *RESUMEN DE JORNADA:*`,
    `• Animales revisados: ${reporte.animalesRevisados}`,
    `• Vacunas aplicadas: ${reporte.vacunasAplicadas}`,
    `• Inversión en medicinas: $${(reporte.costoTotalMedicinas || 0).toLocaleString()} MXN`,
    `• Tratamientos médicos: ${reporte.tratamientosAplicados}`,
    `• Nacimientos hoy: ${reporte.nacimientosRegistrados}`,
    `• Ventas realizadas: ${reporte.ventasRegistradas}`,
    `• Muertes registradas: ${reporte.muertesRegistradas}`,
    `• Total hato activo: ${reporte.totalAnimalesActivos}`,
    `---------------------------------`,
  ];

  if (reporte.registrosDetallados.length > 0) {
    lines.push(`📝 *DETALLES REGISTRADOS:*`);
    reporte.registrosDetallados.forEach((d) => {
      lines.push(`- [${d.tipo}] Arete: ${d.arete}: ${d.descripcion}`);
    });
    lines.push(`---------------------------------`);
  }

  if (reporte.observacionesGenerales) {
    lines.push(`📌 *Observaciones:* ${reporte.observacionesGenerales}`);
  }

  lines.push(`_Generado automáticamente con GanadoPro Offline_`);
  return lines.join('\n');
}
