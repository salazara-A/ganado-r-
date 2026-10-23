import React, { useState, useEffect } from 'react';
import { HistorialClinicoItem, Livestock, TipoTratamiento, ViaAdministracion } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { Syringe, Bell, Calendar, Clock, Volume2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimal?: Livestock | null;
  existingItem?: HistorialClinicoItem | null;
  onSaved: () => void;
  activeAnimals: Livestock[];
}

// Vacunas y medicamentos comunes en ganadería bovina con miligramos y costos aproximados
const MEDICAMENTOS_COMUNES = [
  { nombre: 'Derriengue (Rabia Paralítica Bovina)', tipo: 'Vacuna', concentracionMg: 'Cepa ERA Inactivada', dosis: '2 ml', via: 'Subcutánea', costo: 380 },
  { nombre: 'Clostridiosis 8 Vías (Carbunclo / Pierna Negra)', tipo: 'Vacuna', concentracionMg: '50 mcg/ml Antígenos', dosis: '5 ml', via: 'Subcutánea', costo: 420 },
  { nombre: 'Brucelosis (Cepa 19 o RB51)', tipo: 'Vacuna', concentracionMg: 'Bacterias Vivas Atenuadas', dosis: '2 ml', via: 'Subcutánea', costo: 350 },
  { nombre: 'Complejo Respiratorio Bovino (IBR / DVB)', tipo: 'Vacuna', concentracionMg: 'Virus Modificado', dosis: '5 ml', via: 'Intramuscular', costo: 460 },
  { nombre: 'Fiebre Carbonosa (Ántrax)', tipo: 'Vacuna', concentracionMg: 'Esporas Sterne 34F2', dosis: '1 ml', via: 'Subcutánea', costo: 280 },
  { nombre: 'Ivermectina al 3.15% (Desparasitante)', tipo: 'Desparasitación', concentracionMg: '31.5 mg/ml (3.15%)', dosis: '1 ml / 50 kg', via: 'Subcutánea', costo: 580 },
  { nombre: 'Albendazol al 10% (Oral)', tipo: 'Desparasitación', concentracionMg: '100 mg/ml (10%)', dosis: '10 ml / 100 kg', via: 'Oral', costo: 320 },
  { nombre: 'Vigantol ADE Fuerte (Vitaminas)', tipo: 'Vitamina', concentracionMg: '500,000 UI Vit A + 75,000 UI D3', dosis: '5 ml', via: 'Intramuscular', costo: 490 },
  { nombre: 'Cacodil B12 + Fósforo (Tónico)', tipo: 'Vitamina', concentracionMg: 'Cacodilato 30 mg/ml + B12', dosis: '10 ml', via: 'Intramuscular', costo: 260 },
  { nombre: 'Oxitetraciclina L.A. 200 (Antibiótico)', tipo: 'Antibiótico', concentracionMg: '200 mg/ml', dosis: '1 ml / 10 kg', via: 'Intramuscular', costo: 310 },
  { nombre: 'Penicilina Estreptomicina Compuesta', tipo: 'Antibiótico', concentracionMg: '200,000 UI + 250 mg/ml', dosis: '15 ml', via: 'Intramuscular', costo: 290 },
  { nombre: 'Curabichera / Larvicida en Spray (Gusaneras)', tipo: 'Cirugía / Curación', concentracionMg: 'Fenitrotión 1% + Aceite de Pino', dosis: 'Tópica directa', via: 'Tópica / Baño', costo: 180 },
];

export const VaccineAlarmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedAnimal,
  existingItem,
  onSaved,
  activeAnimals,
}) => {
  const [animalId, setAnimalId] = useState('');
  const [arete, setArete] = useState('');
  const [tipo, setTipo] = useState<TipoTratamiento>('Vacuna');
  const [medicamento, setMedicamento] = useState('');
  const [concentracionMg, setConcentracionMg] = useState('200 mg/ml');
  const [costoMedicamento, setCostoMedicamento] = useState<number>(380);
  const [dosis, setDosis] = useState('');
  const [via, setVia] = useState<ViaAdministracion>('Subcutánea');
  const [fechaAplicacion, setFechaAplicacion] = useState(new Date().toISOString().split('T')[0]);
  const [fechaProximaDosis, setFechaProximaDosis] = useState('');
  const [alarmaActiva, setAlarmaActiva] = useState(true);
  const [diasAlarmaAnticipacion, setDiasAlarmaAnticipacion] = useState(2);
  const [loteLaboratorio, setLoteLaboratorio] = useState('');
  const [diasRetiroCarne, setDiasRetiroCarne] = useState(0);
  const [diasRetiroLeche, setDiasRetiroLeche] = useState(0);
  const [veterinario, setVeterinario] = useState('');
  const [notas, setNotas] = useState('');
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setAnimalId(existingItem.animalId);
      setArete(existingItem.arete);
      setTipo(existingItem.tipo);
      setMedicamento(existingItem.medicamento);
      setDosis(existingItem.dosis);
      setConcentracionMg(existingItem.concentracionMg || '200 mg/ml');
      setCostoMedicamento(existingItem.costoMedicamento || 0);
      setVia(existingItem.via);
      setFechaAplicacion(existingItem.fechaAplicacion);
      setFechaProximaDosis(existingItem.fechaProximaDosis || '');
      setAlarmaActiva(existingItem.alarmaActiva ?? true);
      setDiasAlarmaAnticipacion(existingItem.diasAlarmaAnticipacion ?? 2);
      setLoteLaboratorio(existingItem.loteLaboratorio || '');
      setDiasRetiroCarne(existingItem.diasRetiroCarne || 0);
      setDiasRetiroLeche(existingItem.diasRetiroLeche || 0);
      setVeterinario(existingItem.veterinario || '');
      setNotas(existingItem.notas || '');
      setCompletado(existingItem.completado);
    } else if (selectedAnimal) {
      setAnimalId(selectedAnimal.id);
      setArete(selectedAnimal.arete);
      setTipo('Vacuna');
      setMedicamento('Derriengue (Rabia Paralítica Bovina)');
      setConcentracionMg('Cepa ERA Inactivada');
      setCostoMedicamento(380);
      setDosis('2 ml');
      setVia('Subcutánea');
      setFechaAplicacion(new Date().toISOString().split('T')[0]);
      // Sugerencia 6 meses después
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 6);
      setFechaProximaDosis(nextDate.toISOString().split('T')[0]);
      setAlarmaActiva(true);
      setDiasAlarmaAnticipacion(3);
      setCompletado(false);
    } else if (activeAnimals.length > 0) {
      setAnimalId(activeAnimals[0].id);
      setArete(activeAnimals[0].arete);
    }
  }, [existingItem, selectedAnimal, isOpen, activeAnimals]);

  if (!isOpen) return null;

  const handleAnimalSelect = (id: string) => {
    setAnimalId(id);
    const found = activeAnimals.find((a) => a.id === id);
    if (found) setArete(found.arete);
  };

  const handlePresetMed = (med: typeof MEDICAMENTOS_COMUNES[0]) => {
    setMedicamento(med.nombre);
    setTipo(med.tipo as TipoTratamiento);
    setConcentracionMg(med.concentracionMg);
    setCostoMedicamento(med.costo);
    setDosis(med.dosis);
    setVia(med.via as ViaAdministracion);

    // Calcular fecha recomendada de refuerzo según el biológico
    const d = new Date(fechaAplicacion || new Date().toISOString().split('T')[0]);
    if (med.tipo === 'Vacuna') {
      d.setMonth(d.getMonth() + 6); // 6 meses para derriengue o aftosa
    } else if (med.tipo === 'Desparasitación') {
      d.setMonth(d.getMonth() + 3); // 90 días
    } else if (med.tipo === 'Vitamina') {
      d.setMonth(d.getMonth() + 2); // 60 días
    } else {
      d.setDate(d.getDate() + 3); // 3 días para antibiótico
    }
    setFechaProximaDosis(d.toISOString().split('T')[0]);
  };

  // Posponer / Modificar día de inyectado rápidamente
  const handleShiftDate = (days: number) => {
    const base = fechaProximaDosis ? new Date(fechaProximaDosis) : new Date();
    base.setDate(base.getDate() + days);
    setFechaProximaDosis(base.toISOString().split('T')[0]);
  };

  const handleTestSound = () => {
    notificationService.playAlertChime();
    notificationService.requestNotificationPermission();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arete.trim() || !medicamento.trim()) {
      alert('Por favor ingrese el arete y el nombre del medicamento o vacuna.');
      return;
    }

    const item: HistorialClinicoItem = {
      id: existingItem ? existingItem.id : `clin-${Date.now()}`,
      animalId,
      arete: arete.trim().toUpperCase(),
      tipo,
      medicamento: medicamento.trim(),
      concentracionMg: concentracionMg.trim() || undefined,
      costoMedicamento: Number(costoMedicamento) || 0,
      dosis: dosis.trim(),
      via,
      fechaAplicacion,
      fechaProximaDosis: fechaProximaDosis || undefined,
      diasAlarmaAnticipacion,
      alarmaActiva,
      loteLaboratorio: loteLaboratorio.trim() || undefined,
      diasRetiroCarne: Number(diasRetiroCarne) || 0,
      diasRetiroLeche: Number(diasRetiroLeche) || 0,
      veterinario: veterinario.trim() || undefined,
      notas: notas.trim() || undefined,
      completado,
    };

    livestockStorage.saveClinicalItem(item);
    notificationService.playSuccessSound();
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Cabecera */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-amber-300 border border-emerald-700">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {existingItem ? 'Modificar Registro / Alarma de Inyección' : 'Registrar Vacuna o Tratamiento'}
              </h2>
              <p className="text-xs text-emerald-200">
                Configura la dosis, fecha de inyección y alarma de notificación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Selección de Animal / Arete */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Seleccionar Animal
              </label>
              <select
                value={animalId}
                onChange={(e) => handleAnimalSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              >
                {activeAnimals.map((a) => (
                  <option key={a.id} value={a.id}>
                    Arete: {a.arete} {a.nombre ? `(${a.nombre})` : ''} - {a.categoria} [{a.ubicacion}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Número de Arete (Oficial o Visual)
              </label>
              <input
                type="text"
                required
                value={arete}
                onChange={(e) => setArete(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                placeholder="MX-14-3012"
              />
            </div>
          </div>

          {/* Biológicos frecuentes (Quick select) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Sugerencias rápidas de vacunas y medicinas:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MEDICAMENTOS_COMUNES.slice(0, 5).map((m) => (
                <button
                  key={m.nombre}
                  type="button"
                  onClick={() => handlePresetMed(m)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 transition-colors cursor-pointer"
                >
                  + {m.nombre.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>



          {/* Tipo y Nombre de Medicamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoTratamiento)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              >
                <option value="Vacuna">Vacuna</option>
                <option value="Tratamiento Médico">Tratamiento Médico</option>
                <option value="Desparasitación">Desparasitación</option>
                <option value="Vitamina">Vitamina</option>
                <option value="Antibiótico">Antibiótico</option>
                <option value="Cirugía / Curación">Cirugía / Curación</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nombre del Biológico / Medicamento
              </label>
              <input
                type="text"
                required
                value={medicamento}
                onChange={(e) => setMedicamento(e.target.value)}
                placeholder="Ej. Derriengue (Rabia) / Clostridiasis 8 Vías"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Casilla de Miligramos (Concentración) y Costo de la Medicina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-100 rounded-xl border border-stone-300">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Miligramos / Concentración (mg o %)
              </label>
              <input
                type="text"
                value={concentracionMg}
                onChange={(e) => setConcentracionMg(e.target.value)}
                placeholder="Ej. 200 mg/ml, 500 mg, 3.15%"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Concentración del principio activo por ml o por dosis.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Costo del Medicamento ($ MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-500 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={costoMedicamento}
                  onChange={(e) => setCostoMedicamento(Number(e.target.value))}
                  placeholder="380"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-stone-300 bg-white font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Precio o gasto en la medicina para el reporte del día.
              </span>
            </div>
          </div>

          {/* Dosis, Vía y Fecha Aplicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Dosis
              </label>
              <input
                type="text"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej. 2 ml / 5 ml"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Vía de Aplicación
              </label>
              <select
                value={via}
                onChange={(e) => setVia(e.target.value as ViaAdministracion)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              >
                <option value="Subcutánea">Subcutánea</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Oral">Oral</option>
                <option value="Tópica / Baño">Tópica / Baño</option>
                <option value="Intravenosa">Intravenosa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Fecha Aplicación
              </label>
              <input
                type="date"
                required
                value={fechaAplicacion}
                onChange={(e) => setFechaAplicacion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* SECCIÓN DESTACADA: CONFIGURACIÓN DE ALARMA Y DÍA DE INYECTADO */}
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-stone-950 rounded-xl shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Configuración de Alarma & Próximo Inyectado
                  </h3>
                  <p className="text-xs text-amber-900">
                    Aviso automático cuando llegue el día de la vacuna o revacunación
                  </p>
                </div>
              </div>

              {/* Botón Probar Sonido */}
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-stone-900 text-xs font-semibold cursor-pointer border border-amber-400/60"
                title="Probar sonido campana de alerta"
              >
                <Volume2 className="w-4 h-4 text-amber-800" />
                <span>Probar Alarma</span>
              </button>
            </div>

            {/* Fecha del próximo inyectado */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Fecha Programada de la Próxima Dosis / Inyectado</span>
              </label>
              <input
                type="date"
                value={fechaProximaDosis}
                onChange={(e) => setFechaProximaDosis(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-400 bg-white font-mono font-bold text-stone-900 text-base shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Botones de Modificación Rápida del Día de Inyectado */}
            <div>
              <span className="text-[11px] font-bold text-stone-600 block mb-1">
                Modificar rápidamente el día de inyectado (reprogramar / posponer):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleShiftDate(3)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer"
                >
                  +3 días
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftDate(7)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer"
                >
                  +1 semana (7 días)
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftDate(15)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer"
                >
                  +15 días
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftDate(30)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer"
                >
                  +1 mes (30 días)
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftDate(182)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-xs cursor-pointer"
                >
                  +6 meses (Semestral)
                </button>
              </div>
            </div>

            {/* Opciones de aviso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Anticipación del aviso</span>
                </label>
                <select
                  value={diasAlarmaAnticipacion}
                  onChange={(e) => setDiasAlarmaAnticipacion(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-stone-900 text-xs font-semibold focus:outline-hidden"
                >
                  <option value={0}>El mismo día del inyectado</option>
                  <option value={1}>1 día antes</option>
                  <option value={2}>2 días antes</option>
                  <option value={3}>3 días antes (Recomendado)</option>
                  <option value={5}>5 días antes</option>
                  <option value={7}>1 semana antes</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alarmaActiva}
                    onChange={(e) => setAlarmaActiva(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                  />
                  <span className="text-xs font-bold text-stone-800">
                    Alarma y notificación sonora activa
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Lote, Veterinario y Tiempos de Retiro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Lote / Laboratorio
              </label>
              <input
                type="text"
                value={loteLaboratorio}
                onChange={(e) => setLoteLaboratorio(e.target.value)}
                placeholder="Ej. DER-7819 / Bayer"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Días Retiro Carne
              </label>
              <input
                type="number"
                min="0"
                value={diasRetiroCarne}
                onChange={(e) => setDiasRetiroCarne(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Días Retiro Leche
              </label>
              <input
                type="number"
                min="0"
                value={diasRetiroLeche}
                onChange={(e) => setDiasRetiroLeche(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Veterinario y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Aplicado Por / Veterinario
              </label>
              <input
                type="text"
                value={veterinario}
                onChange={(e) => setVeterinario(e.target.value)}
                placeholder="Ej. MVZ Carlos Mendoza"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-xl bg-stone-100 hover:bg-stone-200 w-full">
                <input
                  type="checkbox"
                  checked={completado}
                  onChange={(e) => setCompletado(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300"
                />
                <span className="text-xs font-bold text-stone-800">
                  {completado ? 'Tratamiento Completado / Inyectado' : 'Pendiente por Inyectar'}
                </span>
              </label>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Notas u Observaciones Clínicas
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Animal respondió bien. Sin reacciones adversas en corral."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Registro & Alarma</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
