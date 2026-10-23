import React from 'react';
import { Livestock, HistorialClinicoItem, UPPConfig, AlertaRecordatorio } from '../types/livestock';
import {
  Tag,
  Syringe,
  Baby,
  Calendar,
  Building2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Scale,
} from 'lucide-react';

interface Props {
  animals: Livestock[];
  clinicalItems: HistorialClinicoItem[];
  alerts: AlertaRecordatorio[];
  upp: UPPConfig;
  onOpenNewAnimal: () => void;
  onOpenVaccineModal: () => void;
  onOpenCalendar: () => void;
  onOpenAlerts: () => void;
}

export const DashboardOverview: React.FC<Props> = ({
  animals,
  clinicalItems,
  alerts,
  upp,
  onOpenNewAnimal,
  onOpenVaccineModal,
  onOpenCalendar,
  onOpenAlerts,
}) => {
  const activeAnimals = animals.filter((a) => a.estado === 'Activo');
  const hembras = activeAnimals.filter((a) => a.genero === 'Hembra').length;
  const machos = activeAnimals.filter((a) => a.genero === 'Macho').length;
  const vacas = activeAnimals.filter((a) => a.categoria === 'Vaca').length;
  const novillonas = activeAnimals.filter((a) => a.categoria === 'Novillona').length;
  const becerros = activeAnimals.filter((a) => a.categoria === 'Becerro' || a.categoria === 'Becerra').length;
  const toros = activeAnimals.filter((a) => a.categoria === 'Toro').length;
  const gestantes = activeAnimals.filter((a) => a.estadoReproductivo === 'Gestante').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const vacunasHoy = clinicalItems.filter(
    (c) => c.fechaProximaDosis === todayStr && !c.completado
  ).length;
  const vacunasVencidas = clinicalItems.filter(
    (c) => c.fechaProximaDosis && c.fechaProximaDosis < todayStr && !c.completado
  ).length;

  return (
    <div className="space-y-3">
      {/* Banner de Bienvenida y Ubicación de Faena */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        {/* Decoración silueta de fondo */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl">🐂</span>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-amber-300 font-mono text-xs font-bold border border-emerald-600/50">
                UPP: {upp.clave}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-xs font-black">
                📍 {upp.ubicacionActiva}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {upp.ubicacionActiva}
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              Productor: <strong className="text-white">{upp.nombreProductor}</strong>. 
              Control de aretes, calendario de vacunación, registro de nacimientos y reporte diario.
            </p>
          </div>

          {/* Alertas Urgentes */}
          <div className="flex items-center gap-2">
            {(vacunasHoy > 0 || vacunasVencidas > 0) && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-4 h-4 text-stone-950" />
                <span>
                  {vacunasVencidas > 0
                    ? `⚠️ ${vacunasVencidas} Vacuna(s) Vencida(s)`
                    : `💉 ${vacunasHoy} Vacuna(s) para hoy`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNewAnimal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-stone-100 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>Registrar Arete</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Hato Total Activo
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{activeAnimals.length}</div>
          <span className="text-[10px] text-stone-500 font-medium">
            {hembras} Hembras / {machos} Machos
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Vacas Vientre
          </span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">{vacas}</div>
          <span className="text-[10px] text-stone-500 font-medium">En edad reproductiva</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Novillos & Novillonas
          </span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">{novillonas}</div>
          <span className="text-[10px] text-stone-500 font-medium">Levante y desarrollo</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Becerros / Crías
          </span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">{becerros}</div>
          <span className="text-[10px] text-stone-500 font-medium">Lactantes en potrero</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Vacas Preñadas
          </span>
          <div className="text-2xl font-black text-purple-800 mt-0.5">{gestantes}</div>
          <span className="text-[10px] text-purple-700 font-bold">Partos en seguimiento</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
            Sementales / Toros
          </span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">{toros}</div>
          <span className="text-[10px] text-stone-500 font-medium">Reproductores</span>
        </div>
      </div>
    </div>
  );
};
