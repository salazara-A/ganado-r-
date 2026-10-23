import React, { useState } from 'react';
import { MedicamentoCatalogo, TipoTratamiento, ViaAdministracion } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { useMobileBackHandler } from '../hooks/useMobileBackHandler';
import {
  Syringe,
  Search,
  Plus,
  Calculator,
  Scale,
  Clock,
  DollarSign,
  AlertTriangle,
  Info,
  Check,
  Edit2,
  Trash2,
  X,
  Pill,
  ShieldCheck,
  Building,
  Eye,
  Maximize2,
} from 'lucide-react';

export const MedicinasVademecumSection: React.FC = () => {
  const [catalog, setCatalog] = useState<MedicamentoCatalogo[]>(() =>
    livestockStorage.getMedicamentosCatalogo()
  );
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('TODAS');
  const [filterVia, setFilterVia] = useState<string>('TODAS');

  // Medicina seleccionada para ver el informe detallado
  const [selectedMed, setSelectedMed] = useState<MedicamentoCatalogo>(() => {
    const list = livestockStorage.getMedicamentosCatalogo();
    return list[0] || ({} as MedicamentoCatalogo);
  });

  // Estado para la Pestaña / Ventana Flotante con las indicaciones
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Estados para el Modal de Agregar / Editar Medicina
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  // Soporte para botón atrás del celular
  useMobileBackHandler(isDetailModalOpen, () => setIsDetailModalOpen(false), 'medicineDetailModal');
  useMobileBackHandler(isModalOpen, () => setIsModalOpen(false), 'medicineAddEditModal');

  // Peso para la calculadora interactiva de dosis (en kg)
  const [calcPesoKg, setCalcPesoKg] = useState<number>(500);

  // Campos del formulario
  const [formNombre, setFormNombre] = useState('');
  const [formTipo, setFormTipo] = useState<TipoTratamiento>('Vacuna');
  const [formVia, setFormVia] = useState<ViaAdministracion>('Subcutánea');
  const [formConcentracion, setFormConcentracion] = useState('200 mg/ml');
  const [formCosto, setFormCosto] = useState<number>(380);
  const [formTipoDosis, setFormTipoDosis] = useState<'fija' | 'por_peso'>('fija');
  const [formDosisFija, setFormDosisFija] = useState('2 ml por animal');
  const [formMlDosis, setFormMlDosis] = useState<number>(1);
  const [formKgDosis, setFormKgDosis] = useState<number>(50);
  const [formRetiroCarne, setFormRetiroCarne] = useState<number>(28);
  const [formRetiroLeche, setFormRetiroLeche] = useState<number>(0);
  const [formLaboratorio, setFormLaboratorio] = useState('');
  const [formEspecificaciones, setFormEspecificaciones] = useState('');

  // Filtrado de medicinas
  const filteredMeds = catalog.filter((m) => {
    if (filterType !== 'TODAS' && m.tipo !== filterType) return false;
    if (filterVia !== 'TODAS' && m.via !== filterVia) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = m.nombre.toLowerCase().includes(q);
      const matchSpec = m.especificaciones.toLowerCase().includes(q);
      const matchVia = m.via.toLowerCase().includes(q);
      const matchType = m.tipo.toLowerCase().includes(q);
      if (!matchName && !matchSpec && !matchVia && !matchType) return false;
    }
    return true;
  });

  // Cálculo de dosis según el peso seleccionado
  const calculateDoseMl = (med: MedicamentoCatalogo, peso: number): string => {
    if (!med) return '--';
    if (med.tipoDosis === 'fija') {
      return med.dosisFija || '2 ml por animal';
    }
    if (med.mlPorCadaKg) {
      const exactMl = Math.round(peso * med.mlPorCadaKg * 10) / 10;
      return `${exactMl} ml`;
    }
    return 'Consulte etiqueta según recomendación médica';
  };

  // Abrir modal para crear nueva medicina
  const handleOpenAddModal = () => {
    setEditingMedId(null);
    setFormNombre('');
    setFormTipo('Vacuna');
    setFormVia('Subcutánea');
    setFormConcentracion('200 mg/ml');
    setFormCosto(380);
    setFormTipoDosis('fija');
    setFormDosisFija('2 ml por animal');
    setFormMlDosis(1);
    setFormKgDosis(50);
    setFormRetiroCarne(28);
    setFormRetiroLeche(0);
    setFormLaboratorio('');
    setFormEspecificaciones('');
    setIsModalOpen(true);
  };

  // Abrir modal para editar medicina existente
  const handleOpenEditModal = (med: MedicamentoCatalogo) => {
    setEditingMedId(med.id);
    setFormNombre(med.nombre);
    setFormTipo(med.tipo);
    setFormVia(med.via);
    setFormConcentracion(med.concentracionMg);
    setFormCosto(med.costoAprox || 0);
    setFormTipoDosis(med.tipoDosis);
    setFormDosisFija(med.dosisFija || '2 ml por animal');
    if (med.mlPorCadaKg && med.mlPorCadaKg > 0) {
      const kg = Math.round(1 / med.mlPorCadaKg);
      setFormMlDosis(1);
      setFormKgDosis(kg > 0 ? kg : 50);
    } else {
      setFormMlDosis(1);
      setFormKgDosis(50);
    }
    setFormRetiroCarne(med.retiroCarneDias ?? 0);
    setFormRetiroLeche(med.retiroLecheDias ?? 0);
    setFormLaboratorio(med.laboratorioComun || '');
    setFormEspecificaciones(med.especificaciones);
    setIsModalOpen(true);
  };

  // Guardar nueva medicina o cambios
  const handleSaveMedicina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      alert('Por favor ingrese el nombre de la medicina o biológico.');
      return;
    }

    let mlPorCadaKg: number | undefined = undefined;
    let formulaPorKgTexto: string | undefined = undefined;

    if (formTipoDosis === 'por_peso') {
      const kg = formKgDosis > 0 ? formKgDosis : 50;
      const ml = formMlDosis > 0 ? formMlDosis : 1;
      mlPorCadaKg = ml / kg;
      formulaPorKgTexto = `${ml} ml por cada ${kg} kg de peso vivo`;
    }

    const newMed: MedicamentoCatalogo = {
      id: editingMedId || `med-custom-${Date.now()}`,
      nombre: formNombre.trim(),
      tipo: formTipo,
      via: formVia,
      concentracionMg: formConcentracion.trim() || 'No especificada',
      costoAprox: Number(formCosto) || 0,
      tipoDosis: formTipoDosis,
      dosisFija: formTipoDosis === 'fija' ? formDosisFija.trim() : undefined,
      mlPorCadaKg,
      formulaPorKgTexto,
      dosisMinimaMl: formTipoDosis === 'por_peso' ? 2 : undefined,
      dosisMaximaMl: formTipoDosis === 'por_peso' ? 60 : undefined,
      retiroCarneDias: Number(formRetiroCarne) || 0,
      retiroLecheDias: Number(formRetiroLeche) || 0,
      laboratorioComun: formLaboratorio.trim() || 'Laboratorio Veterinario',
      especificaciones:
        formEspecificaciones.trim() ||
        `Medicamento para uso veterinario pecuario. Aplicar según recomendaciones de etiqueta y criterio del productor.`,
    };

    const updatedCatalog = livestockStorage.saveMedicamento(newMed);
    setCatalog(updatedCatalog);
    setSelectedMed(newMed);
    notificationService.playSuccessSound();
    setIsModalOpen(false);
  };

  // Eliminar medicina
  const handleDeleteMedicina = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}" del vademécum?`)) {
      const updated = livestockStorage.deleteMedicamento(id);
      setCatalog(updated);
      if (selectedMed?.id === id && updated.length > 0) {
        setSelectedMed(updated[0]);
      }
      notificationService.playSuccessSound();
    }
  };

  // Seleccionar medicina y abrir la pestaña flotante con indicaciones inmediatas
  const handleSelectMed = (med: MedicamentoCatalogo) => {
    setSelectedMed(med);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera y Botón "Agregar Medicina" */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Vademécum de Medicinas & Vacunas
              </h2>
              <p className="text-xs text-stone-500">
                Catálogo de biológicos, cálculo de dosis por peso, costos y tiempos de retiro
              </p>
            </div>
          </div>

          {/* BOTÓN AGREGAR MEDICINA */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
            <span>Agregar Medicina</span>
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por medicina, síntoma, vía (ej. intravenosa)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 font-medium text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:outline-hidden"
            >
              <option value="TODAS">Todos los tipos de medicina</option>
              <option value="Vacuna">Solo Vacunas</option>
              <option value="Antibiótico">Antibióticos</option>
              <option value="Desparasitación">Desparasitantes</option>
              <option value="Suero / Intravenosa">Sueros e Intravenosas</option>
              <option value="Vitamina">Vitaminas y Minerales</option>
              <option value="Tratamiento Médico">Antiinflamatorios / Analgésicos</option>
              <option value="Cirugía / Curación">Curaciones y Gusaneras</option>
            </select>
          </div>

          <div>
            <select
              value={filterVia}
              onChange={(e) => setFilterVia(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:outline-hidden"
            >
              <option value="TODAS">Todas las vías de inyección</option>
              <option value="Intravenosa">Intravenosa (IV)</option>
              <option value="Subcutánea">Subcutánea (SC)</option>
              <option value="Intramuscular">Intramuscular (IM)</option>
              <option value="Oral">Oral</option>
              <option value="Tópica / Baño">Tópica / Baño</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Lista de Medicinas a la Izquierda + Informe y Calculadora a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* COLUMNA 1: LISTADO DE MEDICINAS */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
          {filteredMeds.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
              <p className="font-bold text-stone-700">No se encontraron medicamentos</p>
              <p className="mt-1">Puedes agregar uno nuevo presionando "Agregar Medicina"</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Medicina
              </button>
            </div>
          ) : (
            filteredMeds.map((med) => {
              const isSelected = selectedMed?.id === med.id;

              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelectMed(med)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-black text-sm text-stone-900 leading-snug group-hover:text-emerald-900 transition-colors">
                      {med.nombre}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        med.tipo === 'Vacuna'
                          ? 'bg-blue-100 text-blue-900'
                          : med.tipo === 'Antibiótico'
                          ? 'bg-red-100 text-red-900'
                          : med.tipo === 'Desparasitación'
                          ? 'bg-amber-100 text-amber-900'
                          : med.tipo === 'Suero / Intravenosa'
                          ? 'bg-cyan-100 text-cyan-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {med.tipo}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {med.especificaciones}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-600 mt-2.5 pt-2 border-t border-stone-100">
                    <span className="font-semibold text-emerald-800">
                      Vía: {med.via}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-800">
                        ${med.costoAprox} MXN
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px] shadow-2xs group-hover:bg-emerald-200 transition-colors">
                        <Eye className="w-3 h-3 text-emerald-800" />
                        <span>Ver Indicaciones</span>
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* COLUMNA 2 (SOLO EN PANTALLA GRANDE / ESCRITORIO): INFORME DETALLADO, CALCULADORA Y ACCIONES */}
        <div className="hidden lg:block lg:col-span-7">
          {selectedMed && selectedMed.nombre ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
              {/* Encabezado del Detalle */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                      {selectedMed.tipo}
                    </span>
                    <span className="text-xs font-bold text-stone-600 font-mono bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                      Vía: <strong>{selectedMed.via}</strong>
                    </span>
                  </div>

                  {/* Botones de Abrir Flotante, Editar y Eliminar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all cursor-pointer"
                      title="Abrir en pestaña flotante ampliada"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Pestaña Flotante</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedMed)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                      title="Editar especificaciones de esta medicina"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedicina(selectedMed.id, selectedMed.nombre)}
                      className="p-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer"
                      title="Eliminar medicina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                  {selectedMed.nombre}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Laboratorio común: <strong>{selectedMed.laboratorioComun || 'Laboratorio Veterinario'}</strong>
                </p>
              </div>

              {/* SECCIÓN 1: INFORME Y ESPECIFICACIONES CLÍNICAS */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-800" />
                  <span>¿Para qué sirve? (Especificaciones Clínicas)</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                  {selectedMed.especificaciones}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-stone-200/80">
                  <div>
                    💊 Concentración: <strong className="text-stone-900">{selectedMed.concentracionMg}</strong>
                  </div>
                  <div>
                    💵 Costo aprox: <strong className="text-emerald-800">${selectedMed.costoAprox} MXN</strong>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: CALCULADORA DE DOSIS SEGÚN PESO O TAMAÑO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500 text-stone-950 rounded-xl shadow-xs">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900">
                        Calculadora de Dosis según Tamaño y Peso
                      </h4>
                      <p className="text-[11px] text-amber-950">
                        {selectedMed.formulaPorKgTexto || selectedMed.dosisFija || 'Cálculo por kilogramo de peso vivo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de Tamaño Rápido de Ganado */}
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                    Selecciona el tamaño del animal:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(60)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 60
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Becerro Chico
                      <span className="block text-[10px] font-mono opacity-80">60 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(150)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 150
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Destetado
                      <span className="block text-[10px] font-mono opacity-80">150 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(300)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 300
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Novillona
                      <span className="block text-[10px] font-mono opacity-80">300 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(500)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 500
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Vaca Adulta
                      <span className="block text-[10px] font-mono opacity-80">500 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(750)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 750
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Semental / Toro
                      <span className="block text-[10px] font-mono opacity-80">750 kg</span>
                    </button>
                  </div>
                </div>

                {/* Slider de Peso Personalizado */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Peso exacto en báscula:</span>
                    <span className="font-mono text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                      {calcPesoKg} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1100"
                    step="5"
                    value={calcPesoKg}
                    onChange={(e) => setCalcPesoKg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>30 kg</span>
                    <span>500 kg</span>
                    <span>1,100 kg</span>
                  </div>
                </div>

                {/* RESULTADO DE LA DOSIS CALCULADA */}
                <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-200 block">
                      Dosis a Inyectar para {calcPesoKg} kg:
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      {calculateDoseMl(selectedMed, calcPesoKg)}
                    </span>
                  </div>

                  <div className="text-right text-xs text-emerald-100 font-medium max-w-44">
                    Vía: <strong className="text-white">{selectedMed.via}</strong>
                    {selectedMed.mlPorCadaKg &&
                      calcPesoKg * selectedMed.mlPorCadaKg > 15 &&
                      selectedMed.via === 'Intramuscular' && (
                        <span className="block text-[10px] text-amber-300 font-bold mt-0.5">
                          ⚠️ Repartir en 2 sitios de inyección
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: TIEMPOS DE RETIRO (LECHE Y CARNE) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    🥩 Retiro en Carne:
                  </span>
                  <span className="text-base font-black text-stone-900">
                    {selectedMed.retiroCarneDias === 0
                      ? '0 días (Sin retiro)'
                      : `${selectedMed.retiroCarneDias} días`}
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Días antes del sacrificio para consumo
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    🥛 Retiro en Leche:
                  </span>
                  <span className="text-base font-black text-stone-900">
                    {selectedMed.retiroLecheDias === 0
                      ? '0 días (Apto para ordeño)'
                      : `${selectedMed.retiroLecheDias} días`}
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Días sin enviar leche al tanque
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
              Selecciona una medicina de la lista para ver su informe clínico.
            </div>
          )}
        </div>
      </div>

      {/* PESTAÑA / VENTANA FLOTANTE CON LAS INDICACIONES CLÍNICAS (NO HASTA ABAJO) */}
      {isDetailModalOpen && selectedMed && selectedMed.nombre && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto">
            {/* Cabecera de la Pestaña Flotante */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-stone-950 shadow-md">
                  <Pill className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-800/90 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-emerald-700">
                      {selectedMed.tipo}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-200 font-mono">
                      Vía: {selectedMed.via}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight mt-0.5">
                    {selectedMed.nombre}
                  </h3>
                  <p className="text-xs text-stone-300">
                    {selectedMed.laboratorioComun || 'Laboratorio Veterinario'} • {selectedMed.concentracionMg}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(selectedMed);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  title="Editar medicina"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Cerrar pestaña flotante"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido Flotante con Scroll suave */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* SECCIÓN 1: INFORME Y ESPECIFICACIONES CLÍNICAS */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-800" />
                  <span>¿Para qué sirve? (Indicaciones Clínicas y Especificaciones)</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                  {selectedMed.especificaciones}
                </p>
                <div className="pt-2.5 flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-stone-200">
                  <div>
                    💊 Concentración: <strong className="text-stone-900">{selectedMed.concentracionMg}</strong>
                  </div>
                  <div>
                    💵 Costo aproximado: <strong className="text-emerald-800">${selectedMed.costoAprox} MXN</strong>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: CALCULADORA DE DOSIS SEGÚN PESO O TAMAÑO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500 text-stone-950 rounded-xl shadow-xs">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900">
                        Calculadora de Dosis según Tamaño y Peso
                      </h4>
                      <p className="text-[11px] text-amber-950 font-semibold">
                        {selectedMed.formulaPorKgTexto || selectedMed.dosisFija || 'Cálculo por kilogramo de peso vivo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de Tamaño Rápido de Ganado */}
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                    Selecciona el tamaño del animal:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(60)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 60
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Becerro Chico
                      <span className="block text-[10px] font-mono opacity-80">60 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(150)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 150
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Destetado
                      <span className="block text-[10px] font-mono opacity-80">150 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(300)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 300
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Novillona
                      <span className="block text-[10px] font-mono opacity-80">300 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(500)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 500
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Vaca Adulta
                      <span className="block text-[10px] font-mono opacity-80">500 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcPesoKg(750)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        calcPesoKg === 750
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Semental / Toro
                      <span className="block text-[10px] font-mono opacity-80">750 kg</span>
                    </button>
                  </div>
                </div>

                {/* Slider de Peso Personalizado */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Peso exacto en báscula:</span>
                    <span className="font-mono text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                      {calcPesoKg} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1100"
                    step="5"
                    value={calcPesoKg}
                    onChange={(e) => setCalcPesoKg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>30 kg</span>
                    <span>500 kg</span>
                    <span>1,100 kg</span>
                  </div>
                </div>

                {/* RESULTADO DE LA DOSIS CALCULADA */}
                <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-200 block">
                      Dosis a Inyectar para {calcPesoKg} kg:
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      {calculateDoseMl(selectedMed, calcPesoKg)}
                    </span>
                  </div>

                  <div className="text-right text-xs text-emerald-100 font-medium max-w-44">
                    Vía: <strong className="text-white">{selectedMed.via}</strong>
                    {selectedMed.mlPorCadaKg &&
                      calcPesoKg * selectedMed.mlPorCadaKg > 15 &&
                      selectedMed.via === 'Intramuscular' && (
                        <span className="block text-[10px] text-amber-300 font-bold mt-0.5">
                          ⚠️ Repartir en 2 sitios de inyección
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: TIEMPOS DE RETIRO (LECHE Y CARNE) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    🥩 Retiro en Carne:
                  </span>
                  <span className="text-base font-black text-stone-900">
                    {selectedMed.retiroCarneDias === 0
                      ? '0 días (Sin retiro)'
                      : `${selectedMed.retiroCarneDias} días`}
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Días antes del sacrificio para consumo
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    🥛 Retiro en Leche:
                  </span>
                  <span className="text-base font-black text-stone-900">
                    {selectedMed.retiroLecheDias === 0
                      ? '0 días (Apto para ordeño)'
                      : `${selectedMed.retiroLecheDias} días`}
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Días sin enviar leche al tanque
                  </p>
                </div>
              </div>
            </div>

            {/* Footer de la Pestaña Flotante */}
            <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleDeleteMedicina(selectedMed.id, selectedMed.nombre);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Medicina</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(selectedMed);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                  <span>Cerrar Indicaciones</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR O EDITAR MEDICINA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-fadeIn">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-emerald-900 to-stone-900 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-stone-950 font-black">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingMedId ? 'Editar Medicina' : 'Agregar Nueva Medicina'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Registra el medicamento o biológico para el catálogo pecuario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveMedicina} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Nombre de la Medicina */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nombre del Biológico o Medicamento *
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej. Complejo B12 Fuerte, Oxitetraciclina L.A., Vacuna Triple Bovina..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              {/* Tipo y Vía */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Tipo de Tratamiento
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as TipoTratamiento)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-900 focus:outline-hidden"
                  >
                    <option value="Vacuna">Vacuna</option>
                    <option value="Antibiótico">Antibiótico</option>
                    <option value="Desparasitación">Desparasitación</option>
                    <option value="Suero / Intravenosa">Suero / Intravenosa</option>
                    <option value="Vitamina">Vitamina o Reconstituyente</option>
                    <option value="Tratamiento Médico">Antiinflamatorio / Analgésico</option>
                    <option value="Cirugía / Curación">Curación / Descorne / Ombligo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Vía de Inyección o Aplicación
                  </label>
                  <select
                    value={formVia}
                    onChange={(e) => setFormVia(e.target.value as ViaAdministracion)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-900 focus:outline-hidden"
                  >
                    <option value="Subcutánea">Subcutánea (SC)</option>
                    <option value="Intramuscular">Intramuscular (IM)</option>
                    <option value="Intravenosa">Intravenosa (IV)</option>
                    <option value="Oral">Oral</option>
                    <option value="Tópica / Baño">Tópica / Baño / Spray</option>
                  </select>
                </div>
              </div>

              {/* Miligramos y Costo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Miligramos / Concentración
                  </label>
                  <input
                    type="text"
                    value={formConcentracion}
                    onChange={(e) => setFormConcentracion(e.target.value)}
                    placeholder="Ej. 200 mg/ml, 3.15%, 500,000 UI"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Costo Aprox del Frasco ($ MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-500 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formCosto}
                      onChange={(e) => setFormCosto(Number(e.target.value))}
                      placeholder="380"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Laboratorio */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Laboratorio o Marca Comercial
                </label>
                <input
                  type="text"
                  value={formLaboratorio}
                  onChange={(e) => setFormLaboratorio(e.target.value)}
                  placeholder="Ej. Lapisa, Virbac, Bayer, Zoetis, Chinoin..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              {/* TIPO DE DOSIFICACIÓN: FIJA O POR PESO */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2.5">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                  Modo de Dosificación en el Rancho
                </span>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDosis"
                      value="fija"
                      checked={formTipoDosis === 'fija'}
                      onChange={() => setFormTipoDosis('fija')}
                      className="accent-amber-600"
                    />
                    <span>Dosis Fija por Cabeza (ej. Vacunas)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDosis"
                      value="por_peso"
                      checked={formTipoDosis === 'por_peso'}
                      onChange={() => setFormTipoDosis('por_peso')}
                      className="accent-amber-600"
                    />
                    <span>Calculada por Kilogramos de Peso</span>
                  </label>
                </div>

                {formTipoDosis === 'fija' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Dosis Fija (ml o cc por animal)
                    </label>
                    <input
                      type="text"
                      value={formDosisFija}
                      onChange={(e) => setFormDosisFija(e.target.value)}
                      placeholder="Ej. 2 ml por animal (dosis oficial)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Mililitros (ml)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={formMlDosis}
                        onChange={(e) => setFormMlDosis(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Por cada Kilogramos (kg) de Peso
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={formKgDosis}
                        onChange={(e) => setFormKgDosis(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <span className="col-span-2 text-[10px] text-amber-900">
                      Regla: {formMlDosis} ml por cada {formKgDosis} kg de peso vivo.
                    </span>
                  </div>
                )}
              </div>

              {/* Tiempos de Retiro */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Retiro en Carne (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formRetiroCarne}
                    onChange={(e) => setFormRetiroCarne(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Retiro en Leche (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formRetiroLeche}
                    onChange={(e) => setFormRetiroLeche(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Para qué sirve / Especificaciones */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  ¿Para qué sirve? (Especificaciones e Indicaciones Clínicas)
                </label>
                <textarea
                  rows={3}
                  value={formEspecificaciones}
                  onChange={(e) => setFormEspecificaciones(e.target.value)}
                  placeholder="Describe las enfermedades que previene o cura, precauciones en hembras gestantes, etc."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                  <span>{editingMedId ? 'Guardar Cambios' : 'Agregar al Vademécum'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
