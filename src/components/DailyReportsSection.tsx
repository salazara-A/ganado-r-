import React, { useState } from 'react';
import { ReporteDiario } from '../types/livestock';
import { generateWhatsAppReportSummary, printCurrentView } from '../services/export';
import {
  FileText,
  Calendar,
  Share2,
  Printer,
  CheckCircle,
  Clock,
  UserCheck,
  Building,
} from 'lucide-react';

interface Props {
  reports: ReporteDiario[];
  onOpenFinalizarDia: () => void;
}

export const DailyReportsSection: React.FC<Props> = ({ reports, onOpenFinalizarDia }) => {
  const [selectedReport, setSelectedReport] = useState<ReporteDiario | null>(
    reports.length > 0 ? reports[0] : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (report: ReporteDiario) => {
    const text = generateWhatsAppReportSummary(report);
    navigator.clipboard.writeText(text);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Historial de Reportes Diarios</h2>
            <p className="text-xs text-stone-500">
              Registros consolidados de fin de jornada pecuaria listos para WhatsApp o impresión
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFinalizarDia}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Finalizar Jornada de Hoy</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-stone-200 text-stone-400">
          <FileText className="w-12 h-12 mx-auto text-stone-300 mb-2" />
          <p className="text-base font-bold text-stone-700">Aún no se ha cerrado ninguna jornada.</p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Al terminar el día de trabajo en el rancho, pulsa el botón "Finalizar Día" para compilar
            todas las vacunas, pesajes, nacimientos y revisiones en un reporte automático.
          </p>
          <button
            onClick={onOpenFinalizarDia}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            Generar Primer Reporte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Lista de Reportes */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Jornadas Archivadas ({reports.length})
            </h3>
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-600/50'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {rep.fecha}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {rep.horaCierre} hrs
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-1 truncate ${
                        isSelected ? 'text-emerald-200' : 'text-stone-500'
                      }`}
                    >
                      {rep.ubicacion} — Resp: {rep.responsable}
                    </p>

                    <div
                      className={`flex items-center gap-2 mt-2 pt-2 text-[11px] font-semibold border-t ${
                        isSelected ? 'border-emerald-800 text-emerald-100' : 'border-stone-100 text-stone-600'
                      }`}
                    >
                      <span>💉 {rep.vacunasAplicadas} vacunas</span>
                      <span>•</span>
                      <span>🐣 {rep.nacimientosRegistrados} crías</span>
                      <span>•</span>
                      <span>💵 {rep.ventasRegistradas} vtas</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vista Previa del Reporte Seleccionado */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      Cierre de Jornada — {selectedReport.fecha}
                    </h3>
                    <p className="text-xs text-stone-500">
                      UPP: {selectedReport.uppClave} | {selectedReport.ubicacion} (Cerrado a las{' '}
                      {selectedReport.horaCierre} hrs)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(selectedReport)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedId === selectedReport.id ? '¡Copiado!' : 'Compartir WhatsApp'}</span>
                    </button>

                    <button
                      onClick={printCurrentView}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Métricas del Reporte */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-lg font-black text-emerald-800">
                      {selectedReport.animalesRevisados}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-bold">Animales Revisados</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-lg font-black text-blue-800">
                      {selectedReport.vacunasAplicadas}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-bold">Vacunas Aplicadas</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-lg font-black text-purple-800">
                      {selectedReport.nacimientosRegistrados}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-bold">Nacimientos</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-lg font-black text-amber-700">
                      {selectedReport.ventasRegistradas}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-bold">Ventas</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-stone-700">
                  <p>
                    <strong>Responsable de campo:</strong> {selectedReport.responsable}
                  </p>
                  <p>
                    <strong>Productor / Titular:</strong> {selectedReport.nombreProductor}
                  </p>
                  {selectedReport.observacionesGenerales && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <strong className="block text-stone-800 mb-0.5">Observaciones de la jornada:</strong>
                      <p className="text-stone-600 italic">{selectedReport.observacionesGenerales}</p>
                    </div>
                  )}
                </div>

                {selectedReport.registrosDetallados.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-stone-700">Actividades registradas en el día:</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedReport.registrosDetallados.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-stone-900">{item.tipo}</span> [Arete:{' '}
                            <span className="font-mono font-semibold">{item.arete}</span>]:{' '}
                            <span className="text-stone-600">{item.descripcion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
