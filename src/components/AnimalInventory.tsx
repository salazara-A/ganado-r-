import React, { useState } from 'react';
import { Livestock, Genero, CategoriaGanado, EstadoAnimal, UPPConfig } from '../types/livestock';
import { exportInventoryToExcel, printCurrentView } from '../services/export';
import {
  Tag,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Printer,
  Syringe,
  Baby,
  Eye,
  MapPin,
  Scale,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  animals: Livestock[];
  upp: UPPConfig;
  onSelectAnimal: (animal: Livestock) => void;
  onOpenNewAnimal: () => void;
  onOpenVaccineModal: (animal: Livestock) => void;
  onOpenHerdEvent: (animal: Livestock, mode: 'Venta' | 'Muerte') => void;
}

export const AnimalInventory: React.FC<Props> = ({
  animals,
  upp,
  onSelectAnimal,
  onOpenNewAnimal,
  onOpenVaccineModal,
  onOpenHerdEvent,
}) => {
  const [search, setSearch] = useState('');
  const [filterUbicacion, setFilterUbicacion] = useState<string>('TODAS');
  const [filterGenero, setFilterGenero] = useState<string>('TODOS');
  const [filterCategoria, setFilterCategoria] = useState<string>('Vaca');
  const [filterEstado, setFilterEstado] = useState<string>('Activo');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filtrado reactivo
  const filteredAnimals = animals.filter((a) => {
    if (filterEstado !== 'TODOS' && a.estado !== filterEstado) return false;
    if (filterUbicacion !== 'TODAS' && a.ubicacion !== filterUbicacion) return false;
    if (filterGenero !== 'TODOS' && a.genero !== filterGenero) return false;
    if (filterCategoria !== 'TODAS' && a.categoria !== filterCategoria) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchArete = a.arete.toLowerCase().includes(q);
      const matchVisual = a.areteVisual?.toLowerCase().includes(q);
      const matchNombre = a.nombre?.toLowerCase().includes(q);
      const matchRaza = a.raza.toLowerCase().includes(q);
      if (!matchArete && !matchVisual && !matchNombre && !matchRaza) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Herramientas */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Inventario de Ganado Bovino
              </h2>
              <p className="text-xs text-stone-500">
                {upp.nombreRancho ? `${upp.nombreRancho} — ` : ''}Aretes, categorías (becerros, novillonas, vacas, toros) y pesaje
              </p>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportInventoryToExcel(filteredAnimals, upp)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition border border-stone-300"
              title="Descargar inventario en archivo de Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Exportar a Excel</span>
            </button>

            <button
              onClick={printCurrentView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition border border-stone-300"
              title="Imprimir lista o guardar en PDF"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onOpenNewAnimal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Arete / Animal</span>
            </button>
          </div>
        </div>

        {/* Buscador de Arete y Filtros Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-stone-100">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por arete (ej. 3012), nombre o raza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
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
              <option value="Becerro">Becerro (Macho)</option>
              <option value="Becerra">Becerra (Hembra)</option>
              <option value="Novillo">Novillo</option>
              <option value="Novillona">Novillona</option>
              <option value="Vaca">Vaca</option>
              <option value="Toro">Toro</option>
            </select>
          </div>

          <div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 font-semibold focus:outline-hidden"
            >
              <option value="Activo">Solo Activos en Hato</option>
              <option value="Vendido">Vendidos</option>
              <option value="Muerto">Muertos / Bajas</option>
              <option value="TODOS">Todos los estados</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <span>
            Mostrando <strong>{filteredAnimals.length}</strong> de <strong>{animals.length}</strong> cabezas registradas
          </span>

          <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Tarjetas Campo
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Tabla Completa
            </button>
          </div>
        </div>
      </div>

      {/* VISTA EN TARJETAS (IDEAL PARA CELULAR / TABLET EN CAMPO) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAnimals.map((animal) => {
            const isFemale = animal.genero === 'Hembra';
            const isGestante = animal.estadoReproductivo === 'Gestante';

            return (
              <div
                key={animal.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Arete grande y Categoría */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Arete de Plástico Amarillo */}
                      <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-black shadow-xs border-2 border-amber-300">
                        <span className="text-[9px] font-bold tracking-tighter opacity-80">ARETE</span>
                        <span className="text-base font-mono leading-none">
                          {animal.areteVisual || animal.arete.slice(-4)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-mono font-bold text-sm text-stone-900">{animal.arete}</h3>
                        </div>
                        {animal.nombre && (
                          <span className="text-xs font-semibold text-emerald-800 block">
                            "{animal.nombre}"
                          </span>
                        )}
                        <span className="text-[11px] text-stone-500">{animal.raza}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isFemale
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {animal.categoria}
                    </span>
                  </div>

                  {/* Datos Clave: Peso, Ubicación y Estado */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        Peso: <strong className="text-stone-900">{animal.pesoKg} kg</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">
                        <strong className="text-stone-900">{animal.ubicacion}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Registro de Cómo Van (Evolución y Salud) */}
                  <div className="mt-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Registro de cómo va:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {animal.gananciaPesoDiariaKg ? `+${animal.gananciaPesoDiariaKg} kg/día` : 'Estable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-700">
                      <span>Condición corporal:</span>
                      <strong className="text-stone-900">{animal.condicionCorporal || '3.5 (Saludable)'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-700">
                      <span>Estado reproductivo:</span>
                      <strong className="text-purple-900 font-bold">{animal.estadoReproductivo}</strong>
                    </div>
                  </div>

                  {/* Estado reproductivo o gestación */}
                  {isGestante && animal.fechaProbableParto && (
                    <div className="mt-2 p-2 rounded-xl bg-purple-50 text-purple-950 text-xs font-semibold border border-purple-200 flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span className="truncate">Parto aprox: {animal.fechaProbableParto}</span>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectAnimal(animal)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-600" />
                    <span>Ver Ficha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenVaccineModal(animal)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    title="Registrar vacuna o inyectado para este animal"
                  >
                    <Syringe className="w-3.5 h-3.5 text-amber-300" />
                    <span>Inyectar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA EN TABLA TRADICIONAL */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100 text-stone-800 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Arete SINIGA</th>
                <th className="py-3 px-3">Arete Visual</th>
                <th className="py-3 px-3">Nombre</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Raza</th>
                <th className="py-3 px-3">Peso</th>
                <th className="py-3 px-3">Ubicación</th>
                <th className="py-3 px-3">Reproductivo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredAnimals.map((animal) => (
                <tr key={animal.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {animal.arete}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-900">
                    {animal.areteVisual || '-'}
                  </td>
                  <td className="py-3 px-3 font-medium text-stone-800">
                    {animal.nombre || '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        animal.genero === 'Hembra' ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {animal.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600">{animal.raza}</td>
                  <td className="py-3 px-3 font-bold text-stone-900">{animal.pesoKg} kg</td>
                  <td className="py-3 px-3 font-semibold text-stone-800">{animal.ubicacion}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-800">{animal.estadoReproductivo}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectAnimal(animal)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenVaccineModal(animal)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 cursor-pointer"
                        title="Registrar vacuna o inyectado"
                      >
                        <Syringe className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAnimals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <Tag className="w-12 h-12 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-bold text-stone-700">No se encontraron animales con los filtros actuales.</p>
          <p className="text-xs text-stone-400 mt-1">
            Intenta buscar con otro arete o presiona "+ Nuevo Arete / Animal" para agregar ganado.
          </p>
        </div>
      )}
    </div>
  );
};
