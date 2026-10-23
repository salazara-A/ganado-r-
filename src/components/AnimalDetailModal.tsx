import React, { useState } from 'react';
import { Livestock, HistorialClinicoItem } from '../types/livestock';
import { printCurrentView } from '../services/export';
import {
  Tag,
  Syringe,
  Baby,
  Calendar,
  Scale,
  MapPin,
  Clock,
  Printer,
  Edit,
  DollarSign,
  Skull,
  X,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  animal: Livestock | null;
  isOpen: boolean;
  onClose: () => void;
  clinicalItems: HistorialClinicoItem[];
  onOpenVaccineModal: (animal: Livestock) => void;
  onEditAnimal: (animal: Livestock) => void;
  onOpenHerdEvent: (animal: Livestock, mode: 'Venta' | 'Muerte' | 'Nacimiento') => void;
}

export const AnimalDetailModal: React.FC<Props> = ({
  animal,
  isOpen,
  onClose,
  clinicalItems,
  onOpenVaccineModal,
  onEditAnimal,
  onOpenHerdEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'clinical'>('info');

  if (!isOpen || !animal) return null;

  // Filtrar historial clínico de este animal
  const animalClinical = clinicalItems.filter((c) => c.animalId === animal.id || c.arete === animal.arete);

  // Calcular edad
  const birthDate = new Date(animal.fechaNacimiento);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  const years = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  const ageDisplay =
    years > 0 ? `${years} año${years > 1 ? 's' : ''} ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}` : `${remainingMonths} meses`;

  // Calcular días para parto si está gestante
  let daysToCalving: number | null = null;
  if (animal.fechaProbableParto) {
    const pDate = new Date(animal.fechaProbableParto).getTime();
    const tDate = new Date(now.toISOString().split('T')[0]).getTime();
    daysToCalving = Math.round((pDate - tDate) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Header con arete ganadero destacado */}
        <div className="bg-emerald-950 text-white p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Arete visual amarillo */}
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-amber-400 text-stone-950 font-black shadow-md border-2 border-amber-300">
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-75">ARETE</span>
                <span className="text-xl sm:text-2xl font-mono leading-none">{animal.areteVisual || animal.arete.slice(-4)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">{animal.arete}</h2>
                  {animal.nombre && (
                    <span className="text-sm font-semibold text-amber-300">"{animal.nombre}"</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-emerald-200">
                  <span className="font-semibold text-white">{animal.categoria}</span>
                  <span>•</span>
                  <span>{animal.raza}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {animal.ubicacion} {animal.potrero ? `(${animal.potrero})` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={printCurrentView}
                className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 cursor-pointer"
                title="Imprimir ficha de animal"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEditAnimal(animal);
                }}
                className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 cursor-pointer"
                title="Editar datos"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-emerald-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              Ficha del Animal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clinical')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clinical'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <Syringe className="w-3.5 h-3.5" />
              <span>Historial Clínico & Vacunas ({animalClinical.length})</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Alerta de parto si está preñada */}
              {animal.estadoReproductivo === 'Gestante' && animal.fechaProbableParto && (
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-600 text-white">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-purple-950">
                      Vaca Gestante — Próximo Parto Estimado
                    </h4>
                    <p className="text-xs text-purple-900 mt-0.5">
                      Fecha calculada: <strong>{animal.fechaProbableParto}</strong>{' '}
                      {daysToCalving !== null && (
                        <span className="font-bold underline">
                          {daysToCalving <= 0
                            ? '(¡Fecha cumplida! Revisar corral de maternidad)'
                            : `(Faltan aprox. ${daysToCalving} días)`}
                        </span>
                      )}
                    </p>
                    {animal.fechaInseminacionOMonta && (
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Fecha de inseminación / monta: {animal.fechaInseminacionOMonta}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Grid de Características Físicas y Productivas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Peso Actual</span>
                  <span className="text-lg font-black text-stone-900">{animal.pesoKg} kg</span>
                  <span className="text-[10px] text-stone-500 block">Último pesaje: {animal.fechaUltimoPesaje || 'N/A'}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Edad Calculada</span>
                  <span className="text-base font-bold text-stone-900">{ageDisplay}</span>
                  <span className="text-[10px] text-stone-500 block">Nac: {animal.fechaNacimiento}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Género / Sexo</span>
                  <span className="text-base font-bold text-stone-900">{animal.genero}</span>
                  <span className="text-[10px] text-stone-500 block">Capa: {animal.color || 'No especificada'}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Reproductivo</span>
                  <span className="text-base font-bold text-emerald-800">{animal.estadoReproductivo}</span>
                  <span className="text-[10px] text-stone-500 block">Estado: {animal.estado}</span>
                </div>
              </div>

              {/* Genealogía */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Genealogía & Pedigrí
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500">Arete Madre:</span>{' '}
                    <strong className="text-stone-900 font-mono">{animal.madreArete || 'Sin registro'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Arete Padre (Semental):</span>{' '}
                    <strong className="text-stone-900 font-mono">{animal.padreArete || 'Sin registro'}</strong>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {animal.notas && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <strong className="text-stone-800 block mb-1">Observaciones / Notas:</strong>
                  <p className="text-stone-600 whitespace-pre-line">{animal.notas}</p>
                </div>
              )}

              {/* Botones de acción rápida en el animal */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVaccineModal(animal);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Syringe className="w-4 h-4 text-amber-300" />
                  <span>Aplicar Vacuna o Tratamiento</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHerdEvent(animal, 'Venta');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Registrar Venta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHerdEvent(animal, 'Muerte');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Skull className="w-4 h-4" />
                  <span>Registrar Defunción</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB HISTORIAL CLÍNICO */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">
                  Control Sanitario de Vacunas y Tratamientos Médicos
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVaccineModal(animal);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Syringe className="w-3.5 h-3.5" />
                  <span>+ Agregar Registro</span>
                </button>
              </div>

              {animalClinical.length === 0 ? (
                <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  <Syringe className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-xs font-semibold text-stone-600">
                    No hay vacunas o tratamientos registrados para este animal aún.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {animalClinical.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        item.completado ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{item.medicamento}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            item.completado ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.completado ? 'Completado' : 'Pendiente / Programado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-600">
                        <div>
                          <strong>Tipo:</strong> {item.tipo}
                        </div>
                        <div>
                          <strong>Dosis:</strong> {item.dosis} ({item.via})
                        </div>
                        <div>
                          <strong>Fecha:</strong> {item.fechaAplicacion}
                        </div>
                      </div>

                      {item.fechaProximaDosis && (
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-950 font-semibold border border-amber-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Próxima dosis / refuerzo: <strong>{item.fechaProximaDosis}</strong>
                          </span>
                          {item.alarmaActiva && (
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">
                              Alarma activa
                            </span>
                          )}
                        </div>
                      )}

                      {((item.diasRetiroCarne ?? 0) > 0 || (item.diasRetiroLeche ?? 0) > 0) && (
                        <div className="text-[11px] text-rose-700 font-semibold">
                          ⚠️ Tiempo de Retiro: {(item.diasRetiroCarne ?? 0) > 0 ? `${item.diasRetiroCarne} días en carne` : ''}{' '}
                          {(item.diasRetiroLeche ?? 0) > 0 ? `| ${item.diasRetiroLeche} días en leche` : ''}
                        </div>
                      )}

                      {item.notas && <p className="text-stone-500 italic">{item.notas}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
