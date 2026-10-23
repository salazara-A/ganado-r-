import React, { useState } from 'react';
import { Livestock, Genero } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { Baby, DollarSign, Skull, X, Check, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeAnimals: Livestock[];
  onSaved: () => void;
  defaultMode?: 'Nacimiento' | 'Venta' | 'Muerte';
  preselectedAnimal?: Livestock | null;
  ubicaciones: string[];
}

export const HerdEventsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeAnimals,
  onSaved,
  defaultMode = 'Nacimiento',
  preselectedAnimal,
  ubicaciones,
}) => {
  const [activeTab, setActiveTab] = useState<'Nacimiento' | 'Venta' | 'Muerte'>(defaultMode);

  // Campos Nacimiento
  const [nacArete, setNacArete] = useState('');
  const [nacAreteVisual, setNacAreteVisual] = useState('');
  const [nacNombre, setNacNombre] = useState('');
  const [nacGenero, setNacGenero] = useState<Genero>('Macho');
  const [nacRaza, setNacRaza] = useState('Brahman x Simmental');
  const [nacPesoKg, setNacPesoKg] = useState(38);
  const [nacMadreArete, setNacMadreArete] = useState(preselectedAnimal?.arete || '');
  const [nacPadreArete, setNacPadreArete] = useState('');
  const [nacFecha, setNacFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nacUbicacion, setNacUbicacion] = useState(ubicaciones[0] || 'Rancho');
  const [nacObservaciones, setNacObservaciones] = useState('');

  // Campos Venta
  const [ventaAnimalId, setVentaAnimalId] = useState(preselectedAnimal?.id || (activeAnimals[0]?.id || ''));
  const [ventaFecha, setVentaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [ventaComprador, setVentaComprador] = useState('');
  const [ventaPrecio, setVentaPrecio] = useState(18000);
  const [ventaPesoKg, setVentaPesoKg] = useState(preselectedAnimal?.pesoKg || 450);
  const [ventaMotivo, setVentaMotivo] = useState('Engorda');
  const [ventaObservaciones, setVentaObservaciones] = useState('');

  // Campos Muerte
  const [muerteAnimalId, setMuerteAnimalId] = useState(preselectedAnimal?.id || (activeAnimals[0]?.id || ''));
  const [muerteFecha, setMuerteFecha] = useState(new Date().toISOString().split('T')[0]);
  const [muerteCausa, setMuerteCausa] = useState('Timpanismo agudo');
  const [muerteDestino, setMuerteDestino] = useState('Entierro sanitario profundo');
  const [muerteObservaciones, setMuerteObservaciones] = useState('');

  if (!isOpen) return null;

  const handleNacimientoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nacArete.trim()) {
      alert('Por favor ingrese el número de arete de la cría.');
      return;
    }

    livestockStorage.recordNacimiento({
      arete: nacArete.trim(),
      areteVisual: nacAreteVisual.trim() || undefined,
      nombre: nacNombre.trim() || undefined,
      genero: nacGenero,
      raza: nacRaza.trim(),
      pesoNacimientoKg: Number(nacPesoKg) || 35,
      madreArete: nacMadreArete.trim() || undefined,
      padreArete: nacPadreArete.trim() || undefined,
      fecha: nacFecha,
      ubicacion: nacUbicacion,
      observaciones: nacObservaciones.trim() || undefined,
    });

    notificationService.playSuccessSound();
    onSaved();
    onClose();
  };

  const handleVentaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = activeAnimals.find((a) => a.id === ventaAnimalId);
    if (!animal) {
      alert('Seleccione un animal válido para registrar la venta.');
      return;
    }

    livestockStorage.recordVenta({
      animalId: animal.id,
      arete: animal.arete,
      fecha: ventaFecha,
      comprador: ventaComprador.trim() || 'Comprador Particular',
      precioTotal: Number(ventaPrecio) || 0,
      pesoVentaKg: Number(ventaPesoKg) || animal.pesoKg,
      motivoVenta: ventaMotivo,
      observaciones: ventaObservaciones.trim() || undefined,
    });

    notificationService.playSuccessSound();
    onSaved();
    onClose();
  };

  const handleMuerteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = activeAnimals.find((a) => a.id === muerteAnimalId);
    if (!animal) {
      alert('Seleccione un animal para registrar el fallecimiento.');
      return;
    }

    if (!confirm(`¿Confirma el registro de defunción del animal con arete ${animal.arete}?`)) {
      return;
    }

    livestockStorage.recordMuerte({
      animalId: animal.id,
      arete: animal.arete,
      fecha: muerteFecha,
      causaMuerte: muerteCausa,
      destinoCadáver: muerteDestino,
      observaciones: muerteObservaciones.trim() || undefined,
    });

    notificationService.playSuccessSound();
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Cabecera y Tabs */}
        <div className="bg-stone-900 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-bold">Novedades y Movimientos del Hato</h2>
              <p className="text-xs text-stone-400">
                Registra altas por nacimiento, ventas comerciales o bajas por mortandad
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('Nacimiento')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Nacimiento'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Baby className="w-4 h-4" />
              <span>Nacimiento</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Venta')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Venta'
                  ? 'bg-amber-600 text-stone-950 font-extrabold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Venta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Muerte')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Muerte'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Skull className="w-4 h-4" />
              <span>Muerte</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL TAB SELECCIONADO */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: NACIMIENTO */}
          {activeTab === 'Nacimiento' && (
            <form onSubmit={handleNacimientoSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                Se agregará la cría directamente al inventario como <strong>Becerro o Becerra</strong> con su arete oficial.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nuevo Arete de la Cría (SINIGA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MX-14-6010"
                    value={nacArete}
                    onChange={(e) => setNacArete(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Arete Visual / Arete Plástico
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 010"
                    value={nacAreteVisual}
                    onChange={(e) => setNacAreteVisual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Sexo de la Cría
                  </label>
                  <select
                    value={nacGenero}
                    onChange={(e) => setNacGenero(e.target.value as Genero)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  >
                    <option value="Macho">Macho (Becerro)</option>
                    <option value="Hembra">Hembra (Becerra)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Peso al Nacer (kg)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="80"
                    value={nacPesoKg}
                    onChange={(e) => setNacPesoKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fecha Nacimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={nacFecha}
                    onChange={(e) => setNacFecha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Arete de la Vaca Madre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. MX-14-3012"
                    value={nacMadreArete}
                    onChange={(e) => setNacMadreArete(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Arete del Padre / Semental
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. MX-14-1008"
                    value={nacPadreArete}
                    onChange={(e) => setNacPadreArete(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Raza
                  </label>
                  <input
                    type="text"
                    value={nacRaza}
                    onChange={(e) => setNacRaza(e.target.value)}
                    placeholder="Brahman x Simmental"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Ubicación / Predio
                  </label>
                  <select
                    value={nacUbicacion}
                    onChange={(e) => setNacUbicacion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  >
                    {ubicaciones.map((ub) => (
                      <option key={ub} value={ub}>
                        {ub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Observaciones del Parto
                </label>
                <textarea
                  rows={2}
                  placeholder="Parto normal en potrero, calostro suministrado a la 1ra hora..."
                  value={nacObservaciones}
                  onChange={(e) => setNacObservaciones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-stone-600 text-sm font-semibold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cría en Inventario</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: VENTA */}
          {activeTab === 'Venta' && (
            <form onSubmit={handleVentaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Animal a Vender
                </label>
                <select
                  value={ventaAnimalId}
                  onChange={(e) => {
                    setVentaAnimalId(e.target.value);
                    const selected = activeAnimals.find((a) => a.id === e.target.value);
                    if (selected) setVentaPesoKg(selected.pesoKg);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                >
                  {activeAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      Arete: {a.arete} {a.nombre ? `(${a.nombre})` : ''} - {a.categoria} [{a.pesoKg} kg]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fecha de Venta
                  </label>
                  <input
                    type="date"
                    required
                    value={ventaFecha}
                    onChange={(e) => setVentaFecha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Comprador / Destino
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ganadera Los Altos / Don Faustino"
                    value={ventaComprador}
                    onChange={(e) => setVentaComprador(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Precio Total ($ MXN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={ventaPrecio}
                    onChange={(e) => setVentaPrecio(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Peso de Salida (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ventaPesoKg}
                    onChange={(e) => setVentaPesoKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Motivo
                  </label>
                  <select
                    value={ventaMotivo}
                    onChange={(e) => setVentaMotivo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  >
                    <option value="Engorda">Engorda / Subasta</option>
                    <option value="Pie de Cría">Pie de Cría</option>
                    <option value="Desecho">Desecho / Rastro</option>
                    <option value="Sustitución">Sustitución</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Observaciones / Guía de Tránsito
                </label>
                <textarea
                  rows={2}
                  placeholder="Número de guía REEMO / Factura pecuaria..."
                  value={ventaObservaciones}
                  onChange={(e) => setVentaObservaciones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-stone-600 text-sm font-semibold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Venta y Dar de Baja</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MUERTE */}
          {activeTab === 'Muerte' && (
            <form onSubmit={handleMuerteSubmit} className="space-y-4">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950">
                El animal se marcará como <strong>Muerto</strong> en el historial general y saldrá del hato activo.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Animal Afectado
                </label>
                <select
                  value={muerteAnimalId}
                  onChange={(e) => setMuerteAnimalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-hidden"
                >
                  {activeAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      Arete: {a.arete} {a.nombre ? `(${a.nombre})` : ''} - {a.categoria} [{a.ubicacion}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fecha de Defunción
                  </label>
                  <input
                    type="date"
                    required
                    value={muerteFecha}
                    onChange={(e) => setMuerteFecha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Causa Probable de Muerte
                  </label>
                  <select
                    value={muerteCausa}
                    onChange={(e) => setMuerteCausa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-hidden"
                  >
                    <option value="Timpanismo agudo">Timpanismo agudo / Empance</option>
                    <option value="Parto distócico / Complicación de parto">Parto distócico / Complicación de parto</option>
                    <option value="Mordedura de serpiente">Mordedura de serpiente</option>
                    <option value="Fiebre carbonosa / Clostridiasis">Fiebre carbonosa / Clostridiasis</option>
                    <option value="Neumonía / Complejo respiratorio">Neumonía / Complejo respiratorio</option>
                    <option value="Accidente / Fractura en barranca">Accidente / Fractura en barranca</option>
                    <option value="Senectud / Edad avanzada">Senectud / Edad avanzada</option>
                    <option value="Causa desconocida">Causa desconocida / Hallazgo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Disposición Sanitaria del Cadáver
                </label>
                <input
                  type="text"
                  value={muerteDestino}
                  onChange={(e) => setMuerteDestino(e.target.value)}
                  placeholder="Ej. Fosa sanitaria con cal / Incineración"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Observaciones / Hallazgos de Necropsia
                </label>
                <textarea
                  rows={2}
                  placeholder="Se revisó corral, sin signos previos de enfermedad..."
                  value={muerteObservaciones}
                  onChange={(e) => setMuerteObservaciones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-stone-600 text-sm font-semibold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Registrar Defunción</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
