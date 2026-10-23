import React from 'react';
import { AlertaRecordatorio, Livestock, HistorialClinicoItem } from '../types/livestock';
import { notificationService } from '../services/notifications';
import {
  Bell,
  Volume2,
  Syringe,
  Baby,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Calendar,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertaRecordatorio[];
  onOpenAnimalDetail: (animalId: string) => void;
  onOpenVaccineModalWithDate: (dateStr: string) => void;
}

export const AlertsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  onOpenAnimalDetail,
  onOpenVaccineModalWithDate,
}) => {
  if (!isOpen) return null;

  const urgentCount = alerts.filter((a) => a.urgencia === 'Vencida' || a.urgencia === 'Alta').length;

  const handleTestChime = () => {
    notificationService.playAlertChime();
    notificationService.requestNotificationPermission();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 overflow-hidden my-6">
        {/* Cabecera */}
        <div className="bg-amber-600 text-stone-950 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-700/80 text-white border border-amber-800">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black">Centro de Alertas & Notificaciones</h2>
              <p className="text-xs font-semibold text-amber-950">
                {urgentCount > 0
                  ? `Tienes ${urgentCount} alerta(s) prioritaria(s) de vacunas o partos`
                  : 'Todas las faenas y calendarios están al corriente'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleTestChime}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="Probar sonido de notificación"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Sonido</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-amber-950 hover:bg-amber-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-stone-700">¡Hato al día! No hay alertas urgentes pendientes.</p>
              <p className="text-xs text-stone-400 mt-1">
                Las alertas se activan automáticamente cuando llega el día de una vacuna o un parto.
              </p>
            </div>
          ) : (
            alerts.map((al) => {
              const isUrgent = al.urgencia === 'Vencida' || al.urgencia === 'Alta';

              return (
                <div
                  key={al.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    al.urgencia === 'Vencida'
                      ? 'bg-rose-50 border-rose-300'
                      : al.urgencia === 'Alta'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl text-white ${
                          al.tipo === 'Parto'
                            ? 'bg-purple-600'
                            : al.tipo === 'Vacuna'
                            ? 'bg-blue-600'
                            : 'bg-amber-600'
                        }`}
                      >
                        {al.tipo === 'Parto' ? (
                          <Baby className="w-4 h-4" />
                        ) : (
                          <Syringe className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-stone-900 text-white px-2 py-0.5 rounded-md">
                            Arete: {al.arete}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              al.urgencia === 'Vencida'
                                ? 'bg-rose-200 text-rose-950'
                                : al.urgencia === 'Alta'
                                ? 'bg-amber-300 text-amber-950'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {al.urgencia}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">{al.titulo}</h4>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-stone-600">
                      {al.fechaProgramada}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 mt-2 pl-10">{al.descripcion}</p>

                  <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-end gap-2 pl-10">
                    {al.animalId && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAnimalDetail(al.animalId!);
                        }}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
                      >
                        Ver Ficha del Animal →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
