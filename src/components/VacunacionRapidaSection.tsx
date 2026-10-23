import React, { useState } from 'react';
import { Livestock, HistorialClinicoItem, UPPConfig, ViaAdministracion } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import {
  Syringe,
  CheckCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  X,
  Check,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface Props {
  animals: Livestock[];
  clinicalItems: HistorialClinicoItem[];
  upp: UPPConfig;
  onRefresh: () => void;
}

export const VacunacionRapidaSection: React.FC<Props> = ({
  animals,
  clinicalItems,
  upp,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [filterUbicacion, setFilterUbicacion] = useState<string>('TODAS');
  const [filterCategoria, setFilterCategoria] = useState<string>('TODAS');

  // Modal rápido de "Qué se le puso"
  const [cowToVaccinate, setCowToVaccinate] = useState<Livestock | null>(null);
  const [queSeLePuso, setQueSeLePuso] = useState('Derriengue (Rabia Paralítica Bovina)');
  const [tipoTratamiento, setTipoTratamiento] = useState('Vacuna');
  const [concentracionMg, setConcentracionMg] = useState('Virus Cepa ERA');
  const [dosis, setDosis] = useState('2 ml');
  const [costo, setCosto] = useState<number>(380);
  const [via, setVia] = useState<ViaAdministracion>('Subcutánea');
  const [proximaFecha, setProximaFecha] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [notas, setNotas] = useState('');

  const catalog = livestockStorage.getMedicamentosCatalogo();
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtrado de vacas y ganado
  const activeAnimals = animals.filter((a) => {
    if (a.estado !== 'Activo') return false;
    if (filterUbicacion !== 'TODAS' && a.ubicacion !== filterUbicacion) return false;
    if (filterCategoria !== 'TODAS' && a.categoria !== filterCategoria) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchArete = a.arete.toLowerCase().includes(q);
      const matchVisual = a.areteVisual?.toLowerCase().includes(q);
      const matchNombre = a.nombre?.toLowerCase().includes(q);
      if (!matchArete && !matchVisual && !matchNombre) return false;
    }
    return true;
  });

  const handleOpenVaccinateModal = (cow: Livestock) => {
    setCowToVaccinate(cow);
    setQueSeLePuso('Derriengue (Rabia Paralítica Bovina)');
    setTipoTratamiento('Vacuna');
    setConcentracionMg('Virus Cepa ERA');
    setDosis('2 ml');
    setCosto(380);
    setVia('Subcutánea');
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setProximaFecha(d.toISOString().split('T')[0]);
    setNotas('');
  };

  const handleSelectPredefinedMed = (medNombre: string) => {
    const found = catalog.find((m) => m.nombre === medNombre);
    if (found) {
      setQueSeLePuso(found.nombre);
      setTipoTratamiento(found.tipo);
      setConcentracionMg(found.concentracionMg);
      setCosto(found.costoAprox);
      setVia(found.via);
      if (found.tipoDosis === 'fija') {
        setDosis(found.dosisFija || '2 ml');
      } else if (found.mlPorCadaKg && cowToVaccinate) {
        const calculatedMl = Math.round(cowToVaccinate.pesoKg * found.mlPorCadaKg * 10) / 10;
        setDosis(`${calculatedMl} ml (para ${cowToVaccinate.pesoKg} kg)`);
      }
    }
  };

  const handleConfirmVaccinated = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cowToVaccinate) return;

    const newItem: HistorialClinicoItem = {
      id: `clin-${Date.now()}`,
      animalId: cowToVaccinate.id,
      arete: cowToVaccinate.arete,
      tipo: tipoTratamiento as HistorialClinicoItem['tipo'],
      medicamento: queSeLePuso,
      concentracionMg,
      costoMedicamento: Number(costo) || 0,
      dosis,
      via,
      fechaAplicacion: todayStr,
      fechaProximaDosis: proximaFecha || undefined,
      diasAlarmaAnticipacion: 3,
      alarmaActiva: !!proximaFecha,
      completado: true,
      notas: notas.trim() || `Inyectada en faena el ${todayStr}`,
    };

    livestockStorage.saveClinicalItem(newItem);
    notificationService.playSuccessSound();
    setCowToVaccinate(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-900">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Lista de Vacas & Registro Rápido de Inyección
              </h2>
              <p className="text-xs text-stone-500">
                Toca el botón "Vacunada" en cualquier vaca para registrar al instante qué medicina se le puso
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por arete (ej. 3012) o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 font-medium text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={filterUbicacion}
              onChange={(e) => setFilterUbicacion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:outline-hidden"
            >
              <option value="TODAS">📍 Todas las Ubicaciones</option>
              {upp.ubicaciones.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:outline-hidden"
            >
              <option value="TODAS">Todas las categorías</option>
              <option value="Vaca">Solo Vacas</option>
              <option value="Novillona">Novillonas</option>
              <option value="Becerra">Becerros / Becerros</option>
              <option value="Toro">Toros</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE VACAS CON BOTÓN DIRECTO "VACUNADA" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activeAnimals.map((cow) => {
          // Historial de vacunas de esta vaca
          const vacunasDeEstaVaca = clinicalItems.filter(
            (c) => (c.animalId === cow.id || c.arete === cow.arete) && c.completado
          );
          const vacunasPendientes = clinicalItems.filter(
            (c) => (c.animalId === cow.id || c.arete === cow.arete) && !c.completado
          );

          return (
            <div
              key={cow.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between gap-3"
            >
              <div>
                {/* Arete y Categoría */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-black shadow-xs border-2 border-amber-300">
                      <span className="text-[9px] font-bold tracking-tighter opacity-80">ARETE</span>
                      <span className="text-base font-mono leading-none">
                        {cow.areteVisual || cow.arete.slice(-4)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-mono font-bold text-sm text-stone-900">{cow.arete}</h3>
                      </div>
                      {cow.nombre && (
                        <span className="text-xs font-semibold text-emerald-800 block">
                          "{cow.nombre}"
                        </span>
                      )}
                      <span className="text-[11px] text-stone-500">
                        {cow.categoria} • {cow.raza} ({cow.pesoKg} kg)
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {cow.ubicacion}
                  </span>
                </div>

                {/* Sección "Qué se le ha puesto" */}
                <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-stone-700 block">
                    Qué se le ha puesto a esta vaca:
                  </span>
                  {vacunasDeEstaVaca.length === 0 ? (
                    <span className="text-stone-400 italic text-[11px]">
                      Sin vacunas registradas aún.
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {vacunasDeEstaVaca.slice(0, 3).map((v) => (
                        <div key={v.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-800 font-semibold truncate max-w-44">
                            ✓ {v.medicamento}
                          </span>
                          <span className="text-stone-500 font-mono text-[10px]">
                            {v.fechaAplicacion}
                          </span>
                        </div>
                      ))}
                      {vacunasDeEstaVaca.length > 3 && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          + {vacunasDeEstaVaca.length - 3} tratamientos más aplicados
                        </span>
                      )}
                    </div>
                  )}

                  {/* Alerta de vacuna pendiente */}
                  {vacunasPendientes.length > 0 && (
                    <div className="pt-1 border-t border-stone-200/80 text-[11px] text-amber-800 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pendiente: {vacunasPendientes[0].medicamento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTÓN DESTACADO: VACUNADA / INYECTADA */}
              <button
                type="button"
                onClick={() => handleOpenVaccinateModal(cow)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Syringe className="w-4 h-4 text-amber-300" />
                <span>Vacunada / Inyectar Esta Vaca</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL RÁPIDO: QUÉ SE LE PUSO */}
      {cowToVaccinate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    Registrar Vacunación a Vaca {cowToVaccinate.arete}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {cowToVaccinate.nombre || cowToVaccinate.raza} ({cowToVaccinate.pesoKg} kg)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCowToVaccinate(null)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmVaccinated} className="p-5 space-y-3.5">
              {/* Sugerencias Rápidas */}
              <div>
                <span className="text-[11px] font-bold text-stone-600 block mb-1">
                  Elegir vacuna o medicamento común:
                </span>
                <div className="flex flex-wrap gap-1">
                  {catalog.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectPredefinedMed(m.nombre)}
                      className="px-2 py-1 text-xs rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 border border-stone-200 cursor-pointer"
                    >
                      + {m.nombre.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de la Medicina */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  ¿Qué se le puso? (Nombre del biológico o medicina) *
                </label>
                <input
                  type="text"
                  required
                  value={queSeLePuso}
                  onChange={(e) => setQueSeLePuso(e.target.value)}
                  placeholder="Ej. Derriengue, Clostridiosis, Ivermectina..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              {/* Miligramos y Costo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Miligramos / Concentración
                  </label>
                  <input
                    type="text"
                    value={concentracionMg}
                    onChange={(e) => setConcentracionMg(e.target.value)}
                    placeholder="200 mg/ml o 3.15%"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Costo ($ MXN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={costo}
                    onChange={(e) => setCosto(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dosis y Vía */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Dosis Aplicada
                  </label>
                  <input
                    type="text"
                    required
                    value={dosis}
                    onChange={(e) => setDosis(e.target.value)}
                    placeholder="Ej. 2 ml, 5 ml, 10 ml"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Vía de Inyección
                  </label>
                  <select
                    value={via}
                    onChange={(e) => setVia(e.target.value as ViaAdministracion)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-900 focus:outline-hidden"
                  >
                    <option value="Subcutánea">Subcutánea</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Oral">Oral</option>
                    <option value="Tópica / Baño">Tópica / Baño</option>
                  </select>
                </div>
              </div>

              {/* Próximo refuerzo */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Fecha de Próxima Dosis / Refuerzo (Alarma)
                </label>
                <input
                  type="date"
                  value={proximaFecha}
                  onChange={(e) => setProximaFecha(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Notas de Campo
                </label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Sin hinchazón, aplicada en corral de manejo..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCowToVaccinate(null)}
                  className="px-4 py-2 rounded-xl border text-stone-600 text-xs font-bold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar como Vacunada Hoy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
