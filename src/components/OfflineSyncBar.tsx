import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { Wifi, WifiOff, RefreshCw, DownloadCloud, UploadCloud, CheckCircle2 } from 'lucide-react';

interface Props {
  onDataRefreshed?: () => void;
}

export const OfflineSyncBar: React.FC<Props> = ({ onDataRefreshed }) => {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);
  const pendingCount = livestockStorage.getPendingSyncCount();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await livestockStorage.synchronize();
      notificationService.playSuccessSound();
      setLastSyncMsg(`Sincronizados ${result.syncedItems} registros con éxito.`);
      if (onDataRefreshed) onDataRefreshed();
      setTimeout(() => setLastSyncMsg(null), 4000);
    } catch {
      alert('No se pudo completar la sincronización. Se mantendrán los datos locales.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const backup = livestockStorage.exportFullBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GanadoPro_CopiaSeguridad_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notificationService.playSuccessSound();
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = livestockStorage.importBackup(text);
        if (ok) {
          notificationService.playSuccessSound();
          alert('¡Copia de seguridad restaurada correctamente!');
          if (onDataRefreshed) onDataRefreshed();
        } else {
          alert('El archivo no contiene un formato válido de GanadoPro.');
        }
      } catch {
        alert('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs px-3 sm:px-6 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Estado de Red */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span>Conexión Activa</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-800/80">
              <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Sin Señal / Modo Campo Offline (100% Funcional sin Internet)</span>
            </div>
          )}

          {pendingCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-mono font-medium">
              {pendingCount} cambio{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de sync
            </span>
          )}

          {lastSyncMsg && (
            <span className="text-emerald-300 flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {lastSyncMsg}
            </span>
          )}
        </div>

        {/* Acciones de Sincronización y Respaldo */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              pendingCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title="Sincronizar cambios guardados cuando tengas internet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-amber-300' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
            title="Descargar copia de seguridad completa a tu celular o PC"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Descargar Respaldo</span>
          </button>

          <label
            className="flex items-center gap-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition"
            title="Restaurar copia de respaldo guardada anteriormente"
          >
            <UploadCloud className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Restaurar</span>
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
