import React, { useState } from 'react';
import { Livestock, HistorialClinicoItem } from '../types/livestock';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Syringe,
  Baby,
  Clock,
  CheckCircle,
  Plus,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  animals: Livestock[];
  clinicalItems: HistorialClinicoItem[];
  onRefresh: () => void;
  onOpenNewVaccineModal: (defaultDate?: string) => void;
}

export const CalendarView: React.FC<Props> = ({
  animals,
  clinicalItems,
  onRefresh,
  onOpenNewVaccineModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Primer día del mes y número total de días
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Mapear eventos por fecha (YYYY-MM-DD)
  const eventsByDate = new Map<string, { vaccines: HistorialClinicoItem[]; partos: Livestock[] }>();

  // Agregar vacunas y tratamientos
  clinicalItems.forEach((item) => {
    if (item.fechaProximaDosis) {
      const dateKey = item.fechaProximaDosis;
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, { vaccines: [], partos: [] });
      }
      eventsByDate.get(dateKey)!.vaccines.push(item);
    }
  });

  // Agregar partos previstos
  animals.forEach((a) => {
    if (a.genero === 'Hembra' && a.estadoReproductivo === 'Gestante' && a.fechaProbableParto) {
      const dateKey = a.fechaProbableParto;
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, { vaccines: [], partos: [] });
      }
      eventsByDate.get(dateKey)!.partos.push(a);
    }
  });

  // Eventos del día seleccionado
  const selectedEvents = eventsByDate.get(selectedDateStr) || { vaccines: [], partos: [] };
  const hasEventsOnSelected = selectedEvents.vaccines.length > 0 || selectedEvents.partos.length > 0;

  // Marcar una vacuna como inyectada hoy directamente
  const handleMarkAsInjected = (item: HistorialClinicoItem) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: HistorialClinicoItem = {
      ...item,
      completado: true,
      fechaAplicacion: todayStr,
      notas: `${item.notas || ''} | Inyectado y confirmado en calendario el ${todayStr}`,
    };
    livestockStorage.saveClinicalItem(updated);
    notificationService.playSuccessSound();
    onRefresh();
  };

  // Generar cuadrícula de días
  const calendarCells = [];

  // Días del mes previo
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    calendarCells.push({
      dayNumber: prevDay,
      isCurrentMonth: false,
      dateString: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`,
    });
  }

  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateString: dateStr,
    });
  }

  // Rellenar días del próximo mes para completar cuadrícula (múltiplo de 7)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells && calendarCells.length < 42; d++) {
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateString: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Controles del Calendario */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Calendario Ganadero & Control de Inyección
              </h2>
              <p className="text-xs text-stone-500">
                Visualiza qué días hay vacunas programadas, partos o tratamientos pendientes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition"
            >
              Hoy
            </button>
            <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-300">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-stone-700 cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-bold text-stone-900 min-w-36 text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-stone-700 cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => onOpenNewVaccineModal(selectedDateStr)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Inyección</span>
            </button>
          </div>
        </div>

        {/* Leyenda rápida */}
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-stone-600 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span>Vacunas / Inyecciones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
            <span>Próximos Partos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Tratamientos / Desparasitaciones</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="w-3 h-3 rounded-full border border-stone-300 bg-stone-100 inline-block"></span>
            <span>Día Libre (Sin faena médica)</span>
          </div>
        </div>

        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
          {daysOfWeek.map((dow, idx) => (
            <div
              key={dow}
              className={`text-center py-1.5 text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-amber-700' : 'text-stone-500'
              }`}
            >
              {dow}
            </div>
          ))}

          {calendarCells.map((cell, idx) => {
            const dateEvents = eventsByDate.get(cell.dateString);
            const numVaccines = dateEvents?.vaccines.length || 0;
            const numPartos = dateEvents?.partos.length || 0;
            const totalTasks = numVaccines + numPartos;
            const isToday = cell.dateString === todayIso;
            const isSelected = cell.dateString === selectedDateStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateString)}
                className={`min-h-16 sm:min-h-24 p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/40'
                    : isToday
                    ? 'border-amber-400 bg-amber-50/40'
                    : cell.isCurrentMonth
                    ? 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50/60'
                    : 'border-stone-100 bg-stone-50/40 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isToday
                        ? 'bg-amber-600 text-white'
                        : isSelected
                        ? 'bg-emerald-800 text-white'
                        : cell.isCurrentMonth
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {totalTasks > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-900 text-white">
                      {totalTasks}
                    </span>
                  )}
                </div>

                {/* Marcadores de eventos */}
                <div className="mt-1 space-y-1 w-full overflow-hidden">
                  {numVaccines > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold px-1 py-0.5 rounded-md bg-blue-100 text-blue-900 truncate">
                      <Syringe className="w-2.5 h-2.5 flex-shrink-0 text-blue-700" />
                      <span className="truncate">{numVaccines} Vacuna{numVaccines > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {numPartos > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold px-1 py-0.5 rounded-md bg-purple-100 text-purple-900 truncate">
                      <Baby className="w-2.5 h-2.5 flex-shrink-0 text-purple-700" />
                      <span className="truncate">{numPartos} Parto{numPartos > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Día Seleccionado */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>Tareas y Programación del {selectedDateStr}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {hasEventsOnSelected
                ? 'Hay faenas programadas para este día en el rancho'
                : 'Día sin eventos programados (Lote al día)'}
            </p>
          </div>

          <button
            onClick={() => onOpenNewVaccineModal(selectedDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Tarea a Este Día</span>
          </button>
        </div>

        {/* Lista de Vacunas y Tratamientos del Día */}
        <div className="mt-4 space-y-3">
          {selectedEvents.vaccines.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-blue-700" />
                <span>Vacunas y Tratamientos Programados ({selectedEvents.vaccines.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedEvents.vaccines.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                      item.completado
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-white border-blue-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                          Arete: {item.arete}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.completado
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.completado ? 'Inyectado' : 'Pendiente'}
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-sm mt-1.5">{item.medicamento}</h5>
                      <p className="text-xs text-stone-600">
                        Dosis: <span className="font-semibold text-stone-800">{item.dosis}</span> ({item.via})
                        {item.loteLaboratorio && ` | Lote: ${item.loteLaboratorio}`}
                      </p>
                      {item.notas && <p className="text-xs text-stone-500 italic mt-1">{item.notas}</p>}
                    </div>

                    {!item.completado && (
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleMarkAsInjected(item)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Marcar como Inyectado Hoy</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partos programados del día */}
          {selectedEvents.partos.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-purple-700" />
                <span>Fecha Estimada de Partos ({selectedEvents.partos.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedEvents.partos.map((cow) => (
                  <div
                    key={cow.id}
                    className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-purple-950 bg-purple-200/80 px-2 py-0.5 rounded-md">
                          Arete: {cow.arete}
                        </span>
                        <span className="text-xs font-bold text-stone-700">{cow.nombre || cow.raza}</span>
                      </div>
                      <p className="text-xs text-stone-700 mt-1">
                        Ubicación: <strong className="text-stone-900">{cow.ubicacion}</strong> ({cow.potrero || 'Potrero'})
                      </p>
                      <p className="text-xs text-purple-800 font-semibold mt-1">
                        ⚠️ Mantener en corral de maternidad y revisar ubre / ubre hinchada.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasEventsOnSelected && (
            <div className="text-center py-8 text-stone-400">
              <CalendarIcon className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-600">
                No hay inyecciones ni partos programados para el {selectedDateStr}.
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                Puedes dar clic en "Programar Inyección" para agendar una vacuna en esta fecha.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
