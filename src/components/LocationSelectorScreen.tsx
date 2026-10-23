import React from 'react';
import { Livestock, UsuarioGanadero, UPPConfig } from '../types/livestock';
import { notificationService } from '../services/notifications';
import {
  MapPin,
  Building,
  Check,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface Props {
  user: UsuarioGanadero;
  upp: UPPConfig;
  animals: Livestock[];
  onSelectLocation: (location: string) => void;
  onLogout: () => void;
}

export const LocationSelectorScreen: React.FC<Props> = ({
  user,
  upp,
  animals,
  onSelectLocation,
  onLogout,
}) => {
  // Las 4 casillas requeridas
  const casillas = [
    {
      id: 'Rancho, Corral Nuevo',
      nombre: 'Rancho, Corral Nuevo',
      icono: '🏡',
      desc: 'Área principal de corrales nuevos y manejo',
      color: 'border-emerald-600 bg-emerald-50/40 hover:bg-emerald-100/60',
    },
    {
      id: 'Rancho, Corral Viejo',
      nombre: 'Rancho, Corral Viejo',
      icono: '🏚️',
      desc: 'Corral tradicional y mangas de trabajo',
      color: 'border-amber-600 bg-amber-50/40 hover:bg-amber-100/60',
    },
    {
      id: 'Curva',
      nombre: 'Curva',
      icono: '🔄',
      desc: 'Potrero y linderos de la curva',
      color: 'border-blue-600 bg-blue-50/40 hover:bg-blue-100/60',
    },
    {
      id: 'Ejido',
      nombre: 'Ejido',
      icono: '🌾',
      desc: 'Potreros comunales y agostadero',
      color: 'border-purple-600 bg-purple-50/40 hover:bg-purple-100/60',
    },
  ];

  const handleChoose = (loc: string) => {
    notificationService.playSuccessSound();
    onSelectLocation(loc);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial from-emerald-950/60 via-stone-950 to-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-emerald-950 text-white p-6 sm:p-7 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest bg-emerald-900 px-2 py-0.5 rounded-md">
              UPP: {user.upp}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Bienvenido, {user.nombreProductor}
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              Selecciona en qué predio o corral estás trabajando hoy:
            </p>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white transition cursor-pointer"
            title="Cerrar sesión o cambiar de UPP"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Las 4 Casillas requeridas */}
        <div className="p-6 sm:p-8 space-y-3.5">
          <div className="text-center pb-2">
            <h3 className="text-base font-bold text-stone-800 flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>¿En dónde te encuentras ahora?</span>
            </h3>
            <p className="text-xs text-stone-500">
              Toca una casilla para ver y gestionar el ganado de ese lugar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {casillas.map((c) => {
              const count = animals.filter(
                (a) => a.estado === 'Activo' && a.ubicacion === c.id
              ).length;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleChoose(c.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between gap-2 shadow-xs hover:shadow-md ${c.color}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{c.icono}</span>
                    <span className="text-xs font-mono font-bold bg-white/90 text-stone-900 px-2.5 py-1 rounded-full shadow-xs border border-stone-200">
                      {count} cabezas
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-stone-900 text-base leading-tight">
                      {c.nombre}
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">{c.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Entrar a este lote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => handleChoose('Todas')}
              className="text-xs text-stone-600 hover:text-stone-900 font-bold underline cursor-pointer"
            >
              Ver inventario completo de todas las ubicaciones juntas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
