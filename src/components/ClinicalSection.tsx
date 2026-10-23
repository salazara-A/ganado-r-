import React, { useState } from 'react';
import { HistorialClinicoItem, Livestock, UPPConfig } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { exportClinicalToExcel, printCurrentView } from '../services/export';
import {
  Syringe,
  Bell,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Plus,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  items: HistorialClinicoItem[];
  animals: Livestock[];
  upp: UPPConfig;
  onRefresh: () => void;
  onOpenNewVaccineModal: (animal?: Livestock) => void;
  onEditItem: (item: HistorialClinicoItem) => void;
}

export const ClinicalSection: React.FC<Props> = ({
  items,
  animals,
  upp,
  onRefresh,
  onOpenNewVaccineModal,
  onEditItem,
}) => {
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'PENDIENTES' | 'COMPLETADOS'>('TODOS');
  const [searchArete, setSearchArete] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = items.filter((item) => {
    if (filterType !== 'TODOS' && item.tipo !== filterType) return false;
    if (filterStatus === 'PENDIENTES' && item.completado) return false;
    if (filterStatus === 'COMPLETADOS' && !item.completado) return false;
    if (
      searchArete.trim() &&
      !item.arete.toLowerCase().includes(searchArete.trim().toLowerCase()) &&
      !item.medicamento.toLowerCase().includes(searchArete.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleMarkComplete = (item: HistorialClinicoItem) => {
    const updated: HistorialClinicoItem = {
      ...item,
      completado: true,
      fechaAplicacion: todayStr,
      notas: `${item.notas || ''} | Inyectado hoy ${todayStr}`,
    };
    livestockStorage.saveClinicalItem(updated);
    notificationService.playSuccessSound();
    onRefresh();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('¿Eliminar este registro del historial clínico?')) {
      livestockStorage.deleteClinicalItem(id);
      notificationService.playSuccessSound();
      onRefresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra de Controles y Filtros */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-900">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Historial Clínico & Plan Sanitario</h2>
              <p className="text-xs text-stone-500">
                Registro de vacunas, tratamientos médicos, antibióticos y alarmas de inyección
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportClinicalToExcel(items, upp)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition border border-stone-300"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={printCurrentView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition border border-stone-300"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={() => onOpenNewVaccineModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Vacuna / Alarma</span>
            </button>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
          <input
            type="text"
            placeholder="Buscar por arete o medicamento..."
            value={searchArete}
            onChange={(e) => setSearchArete(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium focus:outline-hidden"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="Vacuna">Vacunas</option>
            <option value="Tratamiento Médico">Tratamiento Médico</option>
            <option value="Desparasitación">Desparasitación</option>
            <option value="Vitamina">Vitaminas</option>
            <option value="Antibiótico">Antibióticos</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'TODOS' | 'PENDIENTES' | 'COMPLETADOS')}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium focus:outline-hidden"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTES">Solo Pendientes / Por Inyectar</option>
            <option value="COMPLETADOS">Solo Inyectados / Completados</option>
          </select>
        </div>
      </div>

      {/* Lista de Registros Clínicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((item) => {
          const isOverdue = item.fechaProximaDosis && item.fechaProximaDosis < todayStr && !item.completado;
          const isToday = item.fechaProximaDosis === todayStr && !item.completado;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isOverdue
                  ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                  : isToday
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                  : item.completado
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-white border-stone-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm bg-stone-900 text-white px-2 py-0.5 rounded-md">
                      Arete: {item.arete}
                    </span>
                    <span className="text-xs font-bold text-stone-600">{item.tipo}</span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-rose-200 text-rose-950 font-black animate-pulse'
                        : isToday
                        ? 'bg-amber-300 text-amber-950 font-black'
                        : item.completado
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {isOverdue
                      ? '¡Vencida!'
                      : isToday
                      ? '¡Inyectar Hoy!'
                      : item.completado
                      ? 'Inyectado'
                      : 'Programado'}
                  </span>
                </div>

                <h3 className="font-bold text-stone-900 text-base mt-2 flex items-center justify-between">
                  <span>{item.medicamento}</span>
                  {item.costoMedicamento !== undefined && item.costoMedicamento > 0 && (
                    <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ${item.costoMedicamento.toLocaleString()} MXN
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mt-1">
                  <div>
                    Dosis: <strong className="text-stone-800">{item.dosis}</strong>
                  </div>
                  <div>
                    Vía: <strong className="text-stone-800">{item.via}</strong>
                  </div>
                  {item.concentracionMg && (
                    <div className="col-span-2 text-amber-950 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200/80 font-semibold text-[11px]">
                      💊 Concentración: <strong>{item.concentracionMg}</strong>
                    </div>
                  )}
                  <div>
                    Aplicado: <span className="font-medium">{item.fechaAplicacion}</span>
                  </div>
                  {item.loteLaboratorio && (
                    <div>
                      Lote: <span className="font-mono">{item.loteLaboratorio}</span>
                    </div>
                  )}
                </div>

                {/* Fecha próxima y alarma */}
                {item.fechaProximaDosis && (
                  <div
                    className={`mt-2.5 p-2 rounded-xl text-xs flex items-center justify-between ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-950 font-bold border border-rose-300'
                        : isToday
                        ? 'bg-amber-200 text-amber-950 font-black border border-amber-300'
                        : 'bg-blue-50 text-blue-950 border border-blue-200 font-semibold'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Próxima dosis: <strong>{item.fechaProximaDosis}</strong>
                    </span>

                    {item.alarmaActiva && (
                      <span className="flex items-center gap-1 text-[10px] bg-white/80 px-1.5 py-0.5 rounded-md">
                        <Bell className="w-3 h-3 text-amber-700" />
                        Alarma On
                      </span>
                    )}
                  </div>
                )}

                {item.notas && <p className="text-xs text-stone-500 italic mt-1.5">{item.notas}</p>}
              </div>

              {/* Acciones de la tarjeta clínica */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditItem(item)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer text-xs flex items-center gap-1"
                    title="Modificar fecha de inyectado o alarma"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modificar fecha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!item.completado && (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>Marcar Inyectado</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <Syringe className="w-12 h-12 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-bold text-stone-700">No se encontraron registros clínicos con estos filtros.</p>
          <p className="text-xs text-stone-400 mt-1">Usa "+ Registrar Vacuna" para agregar una aplicación.</p>
        </div>
      )}
    </div>
  );
};
