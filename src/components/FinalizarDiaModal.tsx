import React, { useState } from 'react';
import { Livestock, HistorialClinicoItem, NovedadHato, ReporteDiario, UPPConfig } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { generateWhatsAppReportSummary, printCurrentView } from '../services/export';
import {
  FileText,
  CheckCircle,
  Printer,
  Share2,
  Copy,
  X,
  Syringe,
  Baby,
  DollarSign,
  Skull,
  UserCheck,
  Building,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  upp: UPPConfig;
  animals: Livestock[];
  clinicalItems: HistorialClinicoItem[];
  herdEvents: NovedadHato[];
  onSaved: () => void;
}

export const FinalizarDiaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  upp,
  animals,
  clinicalItems,
  herdEvents,
  onSaved,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // Filtrar eventos y tratamientos de hoy
  const vacunasHoy = clinicalItems.filter(
    (c) => c.fechaAplicacion === todayStr && c.completado
  );
  const nacimientosHoy = herdEvents.filter(
    (e) => e.tipo === 'Nacimiento' && e.fecha === todayStr
  );
  const ventasHoy = herdEvents.filter(
    (e) => e.tipo === 'Venta' && e.fecha === todayStr
  );
  const muertesHoy = herdEvents.filter(
    (e) => e.tipo === 'Muerte' && e.fecha === todayStr
  );

  const [responsable, setResponsable] = useState(upp.nombreProductor || 'Encargado de Rancho');
  const [animalesRevisados, setAnimalesRevisados] = useState(
    animals.filter((a) => a.estado === 'Activo' && a.ubicacion === upp.ubicacionActiva).length || animals.length
  );
  const [observaciones, setObservaciones] = useState(
    'Jornada concluida sin incidentes. Comederos y bebederos limpios. Cercos revisados.'
  );
  const [reporteGenerado, setReporteGenerado] = useState<ReporteDiario | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCerrarJornada = () => {
    const activeCount = animals.filter((a) => a.estado === 'Activo').length;

    // Compilar items detallados
    const itemsDetalle: Array<{ tipo: string; arete: string; descripcion: string }> = [];

    vacunasHoy.forEach((v) => {
      itemsDetalle.push({
        tipo: 'Vacunación',
        arete: v.arete,
        descripcion: `${v.medicamento} (${v.dosis}) - Vía: ${v.via}`,
      });
    });

    nacimientosHoy.forEach((n) => {
      itemsDetalle.push({
        tipo: 'Nacimiento',
        arete: n.arete,
        descripcion: `Cría ${n.detalles.sexoCria || ''} (${n.detalles.pesoNacimientoKg || ''} kg). Madre: ${n.detalles.madreArete || 'N/A'}`,
      });
    });

    ventasHoy.forEach((v) => {
      itemsDetalle.push({
        tipo: 'Venta',
        arete: v.arete,
        descripcion: `Vendido a ${v.detalles.comprador || ''} por $${v.detalles.precioTotal?.toLocaleString() || 0}`,
      });
    });

    muertesHoy.forEach((m) => {
      itemsDetalle.push({
        tipo: 'Baja/Muerte',
        arete: m.arete,
        descripcion: `Causa: ${m.detalles.causaMuerte || 'N/A'}`,
      });
    });

    const costoTotalMedicinas = vacunasHoy.reduce(
      (sum, item) => sum + (item.costoMedicamento || 0),
      0
    );

    const nuevoReporte: ReporteDiario = {
      id: `rep-${Date.now()}`,
      fecha: todayStr,
      horaCierre: nowTime,
      uppClave: upp.clave,
      nombreProductor: upp.nombreProductor,
      ubicacion: upp.ubicacionActiva,
      responsable: responsable.trim(),
      totalAnimalesActivos: activeCount,
      animalesRevisados: Number(animalesRevisados) || activeCount,
      vacunasAplicadas: vacunasHoy.length,
      costoTotalMedicinas,
      tratamientosAplicados: clinicalItems.filter(
        (c) => c.fechaAplicacion === todayStr && c.tipo !== 'Vacuna' && c.completado
      ).length,
      nacimientosRegistrados: nacimientosHoy.length,
      ventasRegistradas: ventasHoy.length,
      muertesRegistradas: muertesHoy.length,
      observacionesGenerales: observaciones.trim(),
      registrosDetallados: itemsDetalle,
    };

    livestockStorage.saveDailyReport(nuevoReporte);
    notificationService.playSuccessSound();
    setReporteGenerado(nuevoReporte);
    onSaved();
  };

  const handleCopyWhatsApp = () => {
    if (!reporteGenerado) return;
    const text = generateWhatsAppReportSummary(reporteGenerado);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Cabecera */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cierre de Faena & Finalizar Día</h2>
              <p className="text-xs text-emerald-200">
                Generación de reporte automático con todos los registros guardados hoy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!reporteGenerado ? (
            <>
              {/* Resumen del Día Actual */}
              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-300 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700 font-bold">
                    <Building className="w-4 h-4 text-emerald-800" />
                    <span>UPP: {upp.clave} ({upp.nombreRancho})</span>
                  </div>
                  <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-stone-300 text-stone-800 font-bold">
                    Fecha: {todayStr} | {nowTime} hrs
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="text-xl font-black text-emerald-800">{vacunasHoy.length}</div>
                    <div className="text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1">
                      <Syringe className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Vacunas hoy</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="text-xl font-black text-purple-800">{nacimientosHoy.length}</div>
                    <div className="text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1">
                      <Baby className="w-3.5 h-3.5 text-purple-700" />
                      <span>Nacimientos</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="text-xl font-black text-amber-700">{ventasHoy.length}</div>
                    <div className="text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ventas</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="text-xl font-black text-rose-700">{muertesHoy.length}</div>
                    <div className="text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1">
                      <Skull className="w-3.5 h-3.5 text-rose-600" />
                      <span>Bajas / Muerte</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Cierre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Nombre del Responsable / Vaquero</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cabezas de Ganado Revisadas en Campo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={animalesRevisados}
                    onChange={(e) => setAnimalesRevisados(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Observaciones Generales de la Jornada
                </label>
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  placeholder="Comentarios sobre el estado del ganado, agua, pastos o incidencias..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-stone-600 text-sm font-semibold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCerrarJornada}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                  <span>Cerrar Jornada y Generar Reporte</span>
                </button>
              </div>
            </>
          ) : (
            /* VISTA DEL REPORTE GENERADO CON ACCIONES DE IMPRESIÓN Y WHATSAPP */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto mb-1.5" />
                <h3 className="text-base font-extrabold text-emerald-950">
                  ¡Jornada del Día Concluida Exitosamente!
                </h3>
                <p className="text-xs text-emerald-800">
                  El reporte ha sido generado y archivado de forma segura en la memoria de tu dispositivo.
                </p>
              </div>

              {/* Tarjeta del Reporte Listo para Imprimir */}
              <div id="print-daily-report" className="p-5 bg-stone-50 rounded-2xl border border-stone-300 text-sm space-y-3 font-sans">
                <div className="text-center pb-2 border-b border-stone-300">
                  <h4 className="font-black text-stone-900 text-base">
                    REPORTE DIARIO DE ACTIVIDADES PECUARIAS
                  </h4>
                  <p className="text-xs text-stone-600">
                    UPP: {reporteGenerado.uppClave} | {upp.nombreRancho} ({reporteGenerado.ubicacion})
                  </p>
                  <p className="text-xs text-stone-500 font-mono">
                    Fecha: {reporteGenerado.fecha} — Hora: {reporteGenerado.horaCierre} hrs
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    Productor: <strong>{reporteGenerado.nombreProductor}</strong>
                  </div>
                  <div>
                    Responsable: <strong>{reporteGenerado.responsable}</strong>
                  </div>
                  <div>
                    Animales Revisados: <strong>{reporteGenerado.animalesRevisados} cabezas</strong>
                  </div>
                  <div>
                    Hato Activo Total: <strong>{reporteGenerado.totalAnimalesActivos} cabezas</strong>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-bold text-stone-800">Movimientos y Salud:</div>
                  <div>• Vacunas administradas: {reporteGenerado.vacunasAplicadas}</div>
                  <div>• Tratamientos médicos: {reporteGenerado.tratamientosAplicados}</div>
                  <div>• Nuevos nacimientos: {reporteGenerado.nacimientosRegistrados}</div>
                  <div>• Ventas del día: {reporteGenerado.ventasRegistradas}</div>
                  <div>• Muertes / bajas: {reporteGenerado.muertesRegistradas}</div>
                </div>

                {reporteGenerado.registrosDetallados.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-700">Detalles de Registros:</span>
                    <ul className="text-xs space-y-1 pl-2">
                      {reporteGenerado.registrosDetallados.map((item, idx) => (
                        <li key={idx} className="text-stone-700">
                          - <strong className="text-stone-900">{item.tipo}</strong> [Arete: {item.arete}]: {item.descripcion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reporteGenerado.observacionesGenerales && (
                  <div className="pt-2 text-xs text-stone-700 border-t border-stone-200">
                    <strong>Observaciones:</strong> {reporteGenerado.observacionesGenerales}
                  </div>
                )}

                <div className="pt-4 text-center text-[10px] text-stone-400 font-mono">
                  Generado con GanadoPro Sistema Offline — {new Date().toLocaleString('es-MX')}
                </div>
              </div>

              {/* Botones de Compartir e Imprimir */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-amber-300" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar para WhatsApp'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={printCurrentView}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Reporte</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                  >
                    Listo / Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
