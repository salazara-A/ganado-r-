import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si ya está instalada o ejecutándose en modo standalone, no mostramos el botón
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-medium border border-emerald-700/50">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instalado en Celular/PC</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold px-3 py-1.5 text-xs shadow-md transition-all cursor-pointer"
        title="Instalar como app en tu teléfono, tablet o computadora para usar sin internet"
      >
        <Download className="w-4 h-4 text-stone-950" />
        <span>Instalar App Sin Wifi</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 text-xs shadow-md transition-all cursor-pointer"
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-stone-900">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <p>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra inferior de Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <p>Baja y selecciona <strong>"Agregar a pantalla de inicio"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <p>Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Podrás usar GanadoPro sin conexión a internet en el campo.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / standard button (shows instructions or triggers install guide)
  return (
    <button
      onClick={() => {
        alert('Para instalar GanadoPro en tu celular o PC, abre el menú de tu navegador (los 3 puntos ⋮) y selecciona "Instalar aplicación" o "Agregar a pantalla principal". Funcionará 100% sin conexión a internet.');
      }}
      className="hidden md:flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold px-2.5 py-1.5 text-xs transition-all border border-emerald-600/50"
      title="Disponible para instalar sin internet"
    >
      <Download className="w-3.5 h-3.5 text-emerald-300" />
      <span>Modo App PWA</span>
    </button>
  );
};
