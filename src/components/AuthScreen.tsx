import React, { useState } from 'react';
import { livestockStorage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { UsuarioGanadero } from '../types/livestock';
import {
  Building2,
  User,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onAuthenticated: (user: UsuarioGanadero) => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const registeredUsers = livestockStorage.getAllUsers();

  // Campos para acceso manual por UPP
  const [inputUPP, setInputUPP] = useState('');
  const [inputNombre, setInputNombre] = useState('');

  // Campos para registro nuevo
  const [regUPP, setRegUPP] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regRancho, setRegRancho] = useState('');
  const [regError, setRegError] = useState('');

  // Acceso con 1 toque seleccionando un propietario existente
  const handleSelectUser = (user: UsuarioGanadero) => {
    notificationService.playSuccessSound();
    const logged = livestockStorage.loginUserDirect(user);
    onAuthenticated(logged);
  };

  // Acceso escribiendo la UPP directamente
  const handleDirectAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUPP.trim()) return;

    const logged = livestockStorage.loginUserDirect(inputUPP.trim());
    notificationService.playSuccessSound();
    onAuthenticated(logged);
  };

  // Registro de nuevo propietario
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUPP.trim() || !regNombre.trim()) {
      setRegError('Por favor ingresa los números de la UPP y el nombre del propietario.');
      return;
    }

    const newUser = livestockStorage.registerUserWithoutPassword(
      regUPP,
      regNombre,
      regRancho
    );
    notificationService.playSuccessSound();
    onAuthenticated(newUser);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial from-emerald-950/70 via-stone-950 to-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Cabecera institucional ganadera */}
        <div className="bg-emerald-950 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-emerald-600/80 mx-auto flex items-center justify-center text-3xl shadow-lg mb-3">
            🐂
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Ganado<span className="text-amber-400">Pro</span>
          </h1>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Acceso Directo por UPP y Propietario (Sin Contraseña)
          </p>
        </div>

        {/* Pestañas: Seleccionar Propietario vs Registrar Nuevo */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isRegistering
                ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Seleccionar Propietario
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isRegistering
                ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Registrar Nueva UPP
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {!isRegistering ? (
            <div className="space-y-4">
              {/* Lista de Propietarios Registrados para entrar con 1 clic */}
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Propietarios y UPP Registrados (Toca para entrar):</span>
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {registeredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="w-full text-left p-3.5 rounded-2xl border-2 border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-emerald-900 text-amber-300 px-2 py-0.5 rounded-md">
                            UPP: {u.upp}
                          </span>
                        </div>
                        <h3 className="font-black text-stone-900 text-sm mt-1 group-hover:text-emerald-950">
                          {u.nombreProductor}
                        </h3>
                        {u.nombreRancho && (
                          <span className="text-[11px] text-stone-500 block">
                            {u.nombreRancho}
                          </span>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-stone-200 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 text-stone-700 group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* O ingresar escribiendo el número de UPP directamente */}
              <div className="pt-2 border-t border-stone-200">
                <form onSubmit={handleDirectAccess} className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    O Escribe tus Números de UPP:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. 14-045 o números de UPP"
                      value={inputUPP}
                      onChange={(e) => setInputUPP(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1"
                    >
                      <span>Entrar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE REGISTRO SIN CONTRASEÑA */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                Configura los números de tu UPP y el nombre del propietario. No necesitas contraseña para entrar.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Números de la UPP Oficial *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 14-045-0012-001"
                  value={regUPP}
                  onChange={(e) => setRegUPP(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Nombre del Propietario / Responsable *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Don Roberto Garza"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nombre del Rancho o Predio (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Rancho San José"
                  value={regRancho}
                  onChange={(e) => setRegRancho(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-hidden"
                />
              </div>

              {regError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Guardar Propietario y Entrar Directo</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
