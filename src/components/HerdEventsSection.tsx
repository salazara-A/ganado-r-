import React, { useState } from 'react';
import { NovedadHato, Livestock, UPPConfig } from '../types/livestock';
import { printCurrentView } from '../services/export';
import {
  DollarSign,
  Baby,
  Skull,
  Plus,
  Printer,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface Props {
  events: NovedadHato[];
  upp: UPPConfig;
  onOpenNewEvent: (mode?: 'Nacimiento' | 'Venta' | 'Muerte') => void;
}

export const HerdEventsSection: React.FC<Props> = ({ events, upp, onOpenNewEvent }) => {
  const [filterType, setFilterType] = useState<string>('TODOS');

  const filtered = events.filter((e) => {
    if (filterType !== 'TODOS' && e.tipo !== filterType) return false;
    return true;
  });

  const totalNacimientos = events.filter((e) => e.tipo === 'Nacimiento').length;
  const totalVentas = events.filter((e) => e.tipo === 'Venta').length;
  const totalMuertes = events.filter((e) => e.tipo === 'Muerte').length;
  const totalIngresoVentas = events
    .filter((e) => e.tipo === 'Venta')
    .reduce((acc, curr) => acc + (curr.detalles.precioTotal || 0), 0);

  return (
    <div className="space-y-5">
      {/* Resumen Superior */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Nacimientos</span>
            <Baby className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totalNacimientos}</div>
          <span className="text-[11px] text-purple-700 font-semibold">Crías agregadas al hato</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Ventas</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totalVentas}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Cabezas comercializadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Total Vendido</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">
            ${totalIngresoVentas.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-500">Ingreso bruto pecuario</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Bajas / Muertes</span>
            <Skull className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{totalMuertes}</div>
          <span className="text-[11px] text-rose-700 font-semibold">Bajas registradas</span>
        </div>
      </div>

      {/* Controles de Registro de Eventos */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewEvent('Nacimiento')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Baby className="w-4 h-4" />
            <span>+ Registrar Nacimiento</span>
          </button>

          <button
            onClick={() => onOpenNewEvent('Venta')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>+ Registrar Venta</span>
          </button>

          <button
            onClick={() => onOpenNewEvent('Muerte')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Skull className="w-4 h-4" />
            <span>+ Registrar Muerte</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-semibold focus:outline-hidden"
          >
            <option value="TODOS">Todos los movimientos</option>
            <option value="Nacimiento">Nacimientos</option>
            <option value="Venta">Ventas</option>
            <option value="Muerte">Muertes</option>
          </select>

          <button
            onClick={printCurrentView}
            className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer"
            title="Imprimir historial de novedades"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Novedades */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.tipo === 'Nacimiento'
                ? 'border-purple-200 hover:border-purple-300'
                : item.tipo === 'Venta'
                ? 'border-amber-200 hover:border-amber-300'
                : 'border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl text-white ${
                  item.tipo === 'Nacimiento'
                    ? 'bg-purple-600'
                    : item.tipo === 'Venta'
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}
              >
                {item.tipo === 'Nacimiento' ? (
                  <Baby className="w-5 h-5" />
                ) : item.tipo === 'Venta' ? (
                  <DollarSign className="w-5 h-5 text-stone-950" />
                ) : (
                  <Skull className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">
                    {item.tipo}: Arete {item.arete}
                  </span>
                  <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {item.fecha}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {item.ubicacion}
                  </span>
                </div>

                <div className="text-xs text-stone-600 mt-1">
                  {item.tipo === 'Nacimiento' && (
                    <p>
                      Cría {item.detalles.sexoCria || 'N/A'} ({item.detalles.pesoNacimientoKg} kg).
                      {item.detalles.madreArete && ` Madre: ${item.detalles.madreArete}.`}
                    </p>
                  )}
                  {item.tipo === 'Venta' && (
                    <p>
                      Comprador: <strong>{item.detalles.comprador}</strong> | Precio: $
                      {item.detalles.precioTotal?.toLocaleString()} ({item.detalles.pesoVentaKg} kg).
                    </p>
                  )}
                  {item.tipo === 'Muerte' && (
                    <p className="text-rose-700 font-semibold">
                      Causa: {item.detalles.causaMuerte}. Disposición: {item.detalles.destinoCadáver || 'N/A'}.
                    </p>
                  )}
                  {item.detalles.observaciones && (
                    <p className="italic text-stone-500 mt-0.5">{item.detalles.observaciones}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
            <Calendar className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-bold text-stone-700">No hay movimientos registrados con este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};
