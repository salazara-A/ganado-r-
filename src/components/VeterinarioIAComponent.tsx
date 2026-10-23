import React, { useState } from 'react';
import { Livestock } from '../types/livestock';
import { consultarIAVeterinaria, RespuestaIAVeterinaria } from '../services/veterinarioIAService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Scale,
  Syringe,
  Clock,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  selectedAnimal?: Livestock | null;
  onApplyRecommendation?: (rec: {
    medicamento: string;
    dosis: string;
    via: string;
    proximaFecha: string;
  }) => void;
  defaultMedName?: string;
  compact?: boolean;
}

export const VeterinarioIAComponent: React.FC<Props> = ({
  selectedAnimal,
  onApplyRecommendation,
  defaultMedName,
  compact = false,
}) => {
  const isOnline = useOnlineStatus();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RespuestaIAVeterinaria | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Consultas rápidas comunes en campo
  const quickPrompts = [
    {
      title: 'Dosis por Peso',
      query: `Calcular dosis exacta de desparasitante o vacuna para este animal de ${selectedAnimal?.pesoKg || 450} kg.`,
      icon: Scale,
    },
    {
      title: 'Derriengue / Rabia',
      query: '¿Cómo y cuándo aplicar la vacuna de Derriengue (Rabia Paralítica)? ¿Cuál es la dosis y refuerzo?',
      icon: Syringe,
    },
    {
      title: 'Clostridiosis (Mancha)',
      query: '¿A qué edad vacunar contra Clostridiosis/Carbón sintomático y cuántos días después se da el refuerzo?',
      icon: ShieldAlert,
    },
    {
      title: 'Tiempo de Retiro',
      query: '¿Cuántos días de retiro en leche y carne se deben respetar tras aplicar antibióticos o ivermectina?',
      icon: Clock,
    },
    {
      title: 'Seguridad en Preñez',
      query: '¿Cuáles vacunas y desparasitantes son seguros en vacas preñadas y cuáles causan aborto?',
      icon: AlertTriangle,
    },
  ];

  const handleQuery = async (customText?: string) => {
    const queryText = customText || prompt;
    if (!queryText.trim() && !defaultMedName) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await consultarIAVeterinaria({
        prompt: queryText,
        vaccineName: defaultMedName,
        animalContext: selectedAnimal
          ? {
              arete: selectedAnimal.arete,
              categoria: selectedAnimal.categoria,
              genero: selectedAnimal.genero,
              pesoKg: selectedAnimal.pesoKg,
              estadoReproductivo: selectedAnimal.estadoReproductivo,
              ubicacion: selectedAnimal.ubicacion,
            }
          : undefined,
      });
      setResult(resp);
      if (compact) setIsExpanded(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al obtener recomendación.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (!result || !onApplyRecommendation) return;

    // Calcular próxima fecha estimada
    const dias = result.proximaFechaSugeridaDias || 180;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dias);
    const dateStr = targetDate.toISOString().split('T')[0];

    onApplyRecommendation({
      medicamento: defaultMedName || 'Tratamiento sugerido por IA',
      dosis: result.dosisSugerida || '2 ml',
      via: result.viaSugerida || 'Subcutánea',
      proximaFecha: dateStr,
    });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-emerald-800/60 relative overflow-hidden">
      {/* Luz decorativa */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                VetGanado IA
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Asistente Pecuario
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-stone-300">
              {isOnline ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Conectado con Gemini 3.8 Flash • Respuestas en vivo
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Modo Offline • Motor Pecuario Local (Sin internet)
                </span>
              )}
            </p>
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="space-y-3 relative z-10 pt-1">
          {selectedAnimal && (
            <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">Arete: {selectedAnimal.arete}</span>
                <span className="text-stone-400">|</span>
                <span className="text-stone-300">{selectedAnimal.categoria} ({selectedAnimal.pesoKg} kg)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                {selectedAnimal.estadoReproductivo}
              </span>
            </div>
          )}

          {/* Botones de Consulta Rápida */}
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(q.query);
                    handleQuery(q.query);
                  }}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800/90 hover:bg-emerald-800/60 border border-stone-700/80 hover:border-emerald-600 text-[11px] font-medium text-stone-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-300" />
                  <span>{q.title}</span>
                </button>
              );
            })}
          </div>

          {/* Formulario de consulta personalizada */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Pregunta a la IA (ej. ¿Qué dosis de Ivermectina para 450kg?, vacunas de becerro...)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuery();
                  }
                }}
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/95 border border-stone-700 text-xs text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={() => handleQuery()}
              disabled={loading || (!prompt.trim() && !defaultMedName)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Consultando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Consultar IA</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resultado de la IA */}
          {result && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-stone-950/90 border border-emerald-700/60 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-400" />
                  Respuesta de VetGanado IA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                  {result.fuente === 'online-gemini' ? 'Gemini 3.8 Flash' : 'Base Local Offline'}
                </span>
              </div>

              {/* Texto de la respuesta con formato */}
              <div className="text-xs text-stone-200 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto pr-1">
                {result.texto}
              </div>

              {/* Acciones si se puede aplicar al formulario */}
              {onApplyRecommendation && (
                <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400">
                    ¿Deseas cargar esta dosis y vía directamente?
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Aplicar Dosis a la Vaca</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
