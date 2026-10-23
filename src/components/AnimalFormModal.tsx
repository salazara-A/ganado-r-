import React, { useState, useEffect } from 'react';
import { Livestock, Genero, CategoriaGanado, EstadoAnimal, EstadoReproductivo, UPPConfig } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { Tag, Sparkles, Calendar, Check, X, Scale } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  animalToEdit?: Livestock | null;
  upp: UPPConfig;
  onSaved: () => void;
}

const RAZAS_POPULARES = [
  'Brahman Blanco',
  'Brahman Rojo',
  'Angus Negro',
  'Angus Rojo',
  'Simmental',
  'Charolais',
  'Gyr Lechero',
  'Brangus',
  'Beefmaster',
  'Nelore',
  'Suizo Americano',
  'Holstein',
  'Criollo / Cruzado',
];

export const AnimalFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  animalToEdit,
  upp,
  onSaved,
}) => {
  const [arete, setArete] = useState('');
  const [areteVisual, setAreteVisual] = useState('');
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<Genero>('Hembra');
  const [categoria, setCategoria] = useState<CategoriaGanado>('Vaca');
  const [raza, setRaza] = useState('Brahman Blanco');
  const [color, setColor] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('2023-01-15');
  const [pesoKg, setPesoKg] = useState(480);
  const [estado, setEstado] = useState<EstadoAnimal>('Activo');
  const [estadoReproductivo, setEstadoReproductivo] = useState<EstadoReproductivo>('Vacía');
  const [fechaInseminacionOMonta, setFechaInseminacionOMonta] = useState('');
  const [fechaProbableParto, setFechaProbableParto] = useState('');
  const [madreArete, setMadreArete] = useState('');
  const [padreArete, setPadreArete] = useState('');
  const [ubicacion, setUbicacion] = useState(upp.ubicacionActiva || 'Rancho');
  const [potrero, setPotrero] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (animalToEdit) {
      setArete(animalToEdit.arete);
      setAreteVisual(animalToEdit.areteVisual || '');
      setNombre(animalToEdit.nombre || '');
      setGenero(animalToEdit.genero);
      setCategoria(animalToEdit.categoria);
      setRaza(animalToEdit.raza);
      setColor(animalToEdit.color || '');
      setFechaNacimiento(animalToEdit.fechaNacimiento);
      setPesoKg(animalToEdit.pesoKg);
      setEstado(animalToEdit.estado);
      setEstadoReproductivo(animalToEdit.estadoReproductivo);
      setFechaInseminacionOMonta(animalToEdit.fechaInseminacionOMonta || '');
      setFechaProbableParto(animalToEdit.fechaProbableParto || '');
      setMadreArete(animalToEdit.madreArete || '');
      setPadreArete(animalToEdit.padreArete || '');
      setUbicacion(animalToEdit.ubicacion);
      setPotrero(animalToEdit.potrero || '');
      setNotas(animalToEdit.notas || '');
    } else {
      setArete('');
      setAreteVisual('');
      setNombre('');
      setGenero('Hembra');
      setCategoria('Vaca');
      setRaza('Brahman Blanco');
      setColor('');
      setFechaNacimiento(new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPesoKg(480);
      setEstado('Activo');
      setEstadoReproductivo('Vacía');
      setFechaInseminacionOMonta('');
      setFechaProbableParto('');
      setMadreArete('');
      setPadreArete('');
      setUbicacion(upp.ubicacionActiva || 'Rancho');
      setPotrero('');
      setNotas('');
    }
  }, [animalToEdit, isOpen, upp]);

  if (!isOpen) return null;

  // Actualizar categorías acordes al género seleccionado
  const handleGenderChange = (g: Genero) => {
    setGenero(g);
    if (g === 'Hembra') {
      if (categoria === 'Toro' || categoria === 'Novillo' || categoria === 'Becerro' || categoria === 'Buey') {
        setCategoria('Vaca');
      }
      setEstadoReproductivo('Vacía');
    } else {
      if (categoria === 'Vaca' || categoria === 'Novillona' || categoria === 'Becerra') {
        setCategoria('Toro');
      }
      setEstadoReproductivo('No Aplica');
      setFechaInseminacionOMonta('');
      setFechaProbableParto('');
    }
  };

  // Cálculo automático de la fecha probable de parto (~283 días de gestación bovina)
  const handleInseminacionChange = (dateVal: string) => {
    setFechaInseminacionOMonta(dateVal);
    if (dateVal && genero === 'Hembra') {
      const d = new Date(dateVal);
      d.setDate(d.getDate() + 283); // Periodo promedio de gestación en bovinos
      setFechaProbableParto(d.toISOString().split('T')[0]);
      setEstadoReproductivo('Gestante');
    } else {
      setFechaProbableParto('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arete.trim()) {
      alert('Por favor ingrese el número de arete del animal.');
      return;
    }

    const animal: Livestock = {
      id: animalToEdit ? animalToEdit.id : `animal-${Date.now()}`,
      arete: arete.trim().toUpperCase(),
      areteVisual: areteVisual.trim() || undefined,
      nombre: nombre.trim() || undefined,
      genero,
      categoria,
      raza: raza.trim(),
      color: color.trim() || undefined,
      fechaNacimiento,
      pesoKg: Number(pesoKg) || 0,
      fechaUltimoPesaje: new Date().toISOString().split('T')[0],
      estado,
      estadoReproductivo,
      fechaInseminacionOMonta: fechaInseminacionOMonta || undefined,
      fechaProbableParto: fechaProbableParto || undefined,
      madreArete: madreArete.trim() || undefined,
      padreArete: padreArete.trim() || undefined,
      uppId: upp.clave,
      ubicacion,
      potrero: potrero.trim() || undefined,
      notas: notas.trim() || undefined,
      fechaIngreso: animalToEdit ? animalToEdit.fechaIngreso : new Date().toISOString().split('T')[0],
    };

    livestockStorage.saveAnimal(animal);
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
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {animalToEdit ? `Editar Animal ${animalToEdit.arete}` : 'Registrar Nuevo Animal al Hato'}
              </h2>
              <p className="text-xs text-emerald-200">
                Arete, raza, etapa productiva, peso y estado reproductivo
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
          {/* Arete Oficial y Arete Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Número de Arete Oficial (SINIGA) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. MX-14-3012"
                value={arete}
                onChange={(e) => setArete(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-black text-stone-900 text-base focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Arete Visual / Manejo
              </label>
              <input
                type="text"
                placeholder="Ej. 012"
                value={areteVisual}
                onChange={(e) => setAreteVisual(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-900 text-base focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Nombre/Apodo y Género */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nombre o Apodo del Animal
              </label>
              <input
                type="text"
                placeholder="Ej. La Paloma / El Centauro"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Sexo / Género
              </label>
              <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleGenderChange('Hembra')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    genero === 'Hembra'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hembra
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('Macho')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    genero === 'Macho'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Macho
                </button>
              </div>
            </div>
          </div>

          {/* Categoría y Raza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Etapa / Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaGanado)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {genero === 'Hembra' ? (
                  <>
                    <option value="Becerra">Becerra (Cría lactante)</option>
                    <option value="Novillona">Novillona (Levante / Desarrollo)</option>
                    <option value="Vaca">Vaca (Adulta / Vientre)</option>
                  </>
                ) : (
                  <>
                    <option value="Becerro">Becerro (Cría lactante)</option>
                    <option value="Novillo">Novillo (Levante / Engorda)</option>
                    <option value="Toro">Toro (Semental / Reproductor)</option>
                    <option value="Buey">Buey (Castrado de tiro)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Raza
              </label>
              <select
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {RAZAS_POPULARES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Peso y Fecha Nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>Peso Actual (kg)</span>
              </label>
              <input
                type="number"
                min="10"
                max="1500"
                value={pesoKg}
                onChange={(e) => setPesoKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                required
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Color de Capa
              </label>
              <input
                type="text"
                placeholder="Ej. Colorado / Barroso"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Ubicación y Potrero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Ubicación / Predio
              </label>
              <select
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {upp.ubicaciones.map((ub) => (
                  <option key={ub} value={ub}>
                    {ub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Potrero / Lote Específico
              </label>
              <input
                type="text"
                placeholder="Ej. Potrero 2 - La Represa"
                value={potrero}
                onChange={(e) => setPotrero(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* SECCIÓN REPRODUCTIVA & CÁLCULO DE PRÓXIMO PARTO (Si es Hembra) */}
          {genero === 'Hembra' && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700" />
                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                  Control Reproductivo & Alerta de Parto
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estado Reproductivo
                  </label>
                  <select
                    value={estadoReproductivo}
                    onChange={(e) => setEstadoReproductivo(e.target.value as EstadoReproductivo)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-stone-900 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="Vacía">Vacía</option>
                    <option value="Gestante">Gestante / Preñada</option>
                    <option value="Lactando">Lactando</option>
                    <option value="Seca">Seca</option>
                    <option value="En Servicio">En Servicio / Monta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha Monta / Inseminación
                  </label>
                  <input
                    type="date"
                    value={fechaInseminacionOMonta}
                    onChange={(e) => handleInseminacionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-stone-900 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha Estimada Parto (+283 días)
                  </label>
                  <input
                    type="date"
                    value={fechaProbableParto}
                    onChange={(e) => setFechaProbableParto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-purple-400 bg-white font-mono font-bold text-purple-950 text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Genealogía (Arete de Padre y Madre) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Arete de la Madre
              </label>
              <input
                type="text"
                placeholder="Ej. MX-14-3012"
                value={madreArete}
                onChange={(e) => setMadreArete(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Arete del Padre (Toro Semental)
              </label>
              <input
                type="text"
                placeholder="Ej. MX-14-1008"
                value={padreArete}
                onChange={(e) => setPadreArete(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Notas u Observaciones del Animal
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Características fenotípicas, temperamento, procedencia..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-stone-600 text-sm font-semibold hover:bg-stone-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{animalToEdit ? 'Guardar Cambios' : 'Registrar Animal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
