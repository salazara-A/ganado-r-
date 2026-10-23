import React, { useState } from 'react';
import { UPPConfig } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { Building2, MapPin, Plus, Check, X, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUPP: UPPConfig;
  onSave: (updated: UPPConfig) => void;
  requireInitialSetup?: boolean;
}

export const UPPSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUPP,
  onSave,
  requireInitialSetup = false,
}) => {
  const [clave, setClave] = useState(currentUPP.clave || '');
  const [nombreProductor, setNombreProductor] = useState(currentUPP.nombreProductor || '');
  const [nombreRancho, setNombreRancho] = useState(currentUPP.nombreRancho || '');
  const [ubicaciones, setUbicaciones] = useState<string[]>(
    currentUPP.ubicaciones && currentUPP.ubicaciones.length > 0
      ? currentUPP.ubicaciones
      : ['Rancho', 'Curva', 'Ejido']
  );
  const [ubicacionActiva, setUbicacionActiva] = useState(currentUPP.ubicacionActiva || 'Rancho');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [showAddUbicacion, setShowAddUbicacion] = useState(false);

  if (!isOpen) return null;

  const handleAddUbicacion = () => {
    const trimmed = nuevaUbicacion.trim();
    if (trimmed && !ubicaciones.includes(trimmed)) {
      const updated = [...ubicaciones, trimmed];
      setUbicaciones(updated);
      setUbicacionActiva(trimmed);
      setNuevaUbicacion('');
      setShowAddUbicacion(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clave.trim() || !nombreProductor.trim()) {
      alert('Por favor ingrese la Clave UPP o el Nombre del Productor / Responsable.');
      return;
    }

    const updated: UPPConfig = {
      ...currentUPP,
      clave: clave.trim().toUpperCase(),
      nombreProductor: nombreProductor.trim(),
      nombreRancho: nombreRancho.trim() || 'Mi Rancho',
      ubicaciones: ubicaciones.length > 0 ? ubicaciones : ['Rancho', 'Curva', 'Ejido'],
      ubicacionActiva: ubicacionActiva || ubicaciones[0] || 'Rancho',
    };

    livestockStorage.saveUPP(updated);
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Header con estilo ganadero */}
        <div className="bg-emerald-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-800 text-amber-300 border border-emerald-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Unidad de Producción Pecuaria (UPP)</h2>
                <p className="text-xs text-emerald-200">
                  Identificación oficial del predio ganadero y ubicación de trabajo
                </p>
              </div>
            </div>
            {!requireInitialSetup && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Campo Clave UPP */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Clave UPP Oficial (o Registro de Fierro / Patente)</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 14-045-0012-001"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-mono font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Clave de la Unidad de Producción Pecuaria otorgada por SADER / SENASICA.
            </p>
          </div>

          {/* Campo Nombre del Productor / Persona */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nombre del Productor / Titular / Responsable
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Don Roberto Garza"
              value={nombreProductor}
              onChange={(e) => setNombreProductor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Campo Nombre del Rancho */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nombre del Rancho o Finca
            </label>
            <input
              type="text"
              placeholder="Ej. Rancho Santa María"
              value={nombreRancho}
              onChange={(e) => setNombreRancho(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Selector de Ubicación Actual (Rancho, Curva, Ejido) */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>¿En dónde te encuentras ahora? (Ubicación activa)</span>
              </label>
              {!showAddUbicacion && (
                <button
                  type="button"
                  onClick={() => setShowAddUbicacion(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar lugar</span>
                </button>
              )}
            </div>

            {/* Grid de Ubicaciones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ubicaciones.map((ub) => {
                const isSelected = ubicacionActiva === ub;
                return (
                  <button
                    key={ub}
                    type="button"
                    onClick={() => setUbicacionActiva(ub)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-500/50'
                        : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    <span className="truncate">{ub}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Input para agregar nueva ubicación */}
            {showAddUbicacion && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-stone-100 rounded-xl border border-stone-300">
                <input
                  type="text"
                  placeholder="Nombre de lugar (ej. Potrero Curva Sur)"
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUbicacion();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUbicacion}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUbicacion(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
            {!requireInitialSetup && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar y Continuar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
