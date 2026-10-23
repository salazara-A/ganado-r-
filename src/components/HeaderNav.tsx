import React from 'react';
import { UPPConfig, AlertaRecordatorio, UsuarioGanadero } from '../types/livestock';
import { PWAInstallButton } from './PWAInstallButton';
import {
  MapPin,
  Bell,
  CheckCircle2,
  Calendar,
  Syringe,
  Tag,
  DollarSign,
  FileText,
  LogOut,
  Repeat,
  Pill,
} from 'lucide-react';

interface Props {
  activeTab: 'inventario' | 'vacunacion' | 'vademecum' | 'calendario' | 'movimientos';
  setActiveTab: (tab: 'inventario' | 'vacunacion' | 'vademecum' | 'calendario' | 'movimientos') => void;
  upp: UPPConfig;
  currentUser: UsuarioGanadero | null;
  onChangeLocation: () => void;
  onLogout: () => void;
  onOpenAlertsModal: () => void;
  onOpenFinalizarDia: () => void;
  alerts: AlertaRecordatorio[];
}

export const HeaderNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  upp,
  currentUser,
  onChangeLocation,
  onLogout,
  onOpenAlertsModal,
  onOpenFinalizarDia,
  alerts,
}) => {
  const urgentAlertsCount = alerts.filter(
    (a) => a.urgencia === 'Vencida' || a.urgencia === 'Alta'
  ).length;

  const tabs = [
    {
      id: 'inventario' as const,
      label: 'Inventario',
      sublabel: 'Vacas',
      icon: Tag,
      iconColor: 'text-amber-300',
    },
    {
      id: 'vacunacion' as const,
      label: 'Vacunas',
      sublabel: 'Inyectar',
      icon: Syringe,
      iconColor: 'text-blue-300',
    },
    {
      id: 'vademecum' as const,
      label: 'Medicinas',
      sublabel: 'Dosis/Info',
      icon: Pill,
      iconColor: 'text-emerald-300',
    },
    {
      id: 'calendario' as const,
      label: 'Calendario',
      sublabel: 'Días/Parto',
      icon: Calendar,
      iconColor: 'text-emerald-300',
    },
    {
      id: 'movimientos' as const,
      label: 'Reportes',
      sublabel: 'Cierre',
      icon: FileText,
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-40 shadow-md">
      {/* Barra superior: Identidad, Ubicación Actual y Botones de Acción */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Identidad limpia: solo UPP y nombre del productor */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center border border-emerald-700 shadow-xs flex-shrink-0">
            <span className="text-xl">🐂</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                Ganado<span className="text-amber-400">Pro</span>
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-900 text-amber-300 px-1.5 py-0.5 rounded border border-emerald-700">
                UPP: {currentUser?.upp || upp.clave}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 font-medium truncate max-w-48 sm:max-w-xs">
              {currentUser?.nombreProductor || upp.nombreProductor}
            </p>
          </div>
        </div>

        {/* Casilla de Ubicación Activa (Rancho Corral Nuevo / Viejo / Curva / Ejido) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onChangeLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-700 shadow-xs transition-all cursor-pointer"
            title="Cambiar de predio (Rancho Corral Nuevo, Viejo, Curva, Ejido)"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-white">{upp.ubicacionActiva}</span>
            <Repeat className="w-3 h-3 text-emerald-400 ml-0.5" />
          </button>

          {/* Campanita de Alertas */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white cursor-pointer border border-emerald-800 transition"
            title="Alertas de vacunas y partos"
          >
            <Bell className={`w-4 h-4 ${urgentAlertsCount > 0 ? 'text-amber-300 animate-swing' : 'text-emerald-300'}`} />
            {urgentAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-emerald-950">
                {urgentAlertsCount}
              </span>
            )}
          </button>

          {/* Botón PWA Install */}
          <PWAInstallButton />

          {/* BOTÓN DESTACADO: FINALIZAR DÍA */}
          <button
            onClick={onOpenFinalizarDia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-black shadow-md transition-all cursor-pointer border border-amber-300"
            title="Cerrar la faena de hoy y generar reporte automático"
          >
            <CheckCircle2 className="w-4 h-4 text-stone-950" />
            <span className="hidden sm:inline">Finalizar Día</span>
            <span className="sm:hidden">Cerrar Día</span>
          </button>

          {/* Salir / Cerrar Sesión */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-800 transition cursor-pointer"
            title="Cerrar sesión de UPP"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MENÚ FÁCIL SIN DESLIZAR (5 Casillas exactas visibles en toda pantalla) */}
      <div className="bg-emerald-900/80 border-t border-emerald-900/90 px-2 sm:px-6 py-1">
        <div className="max-w-7xl mx-auto grid grid-cols-5 gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 sm:px-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 font-black shadow-sm ring-1 ring-amber-300'
                    : 'text-emerald-100 hover:bg-emerald-800/60 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : tab.iconColor}`} />
                <div className="flex flex-col leading-none">
                  <span className="text-xs sm:text-sm font-bold truncate">{tab.label}</span>
                  <span
                    className={`text-[9px] sm:hidden ${
                      isActive ? 'text-stone-800' : 'text-emerald-300'
                    }`}
                  >
                    {tab.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
