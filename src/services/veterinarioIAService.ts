/**
 * Servicio de IA Veterinaria Especializada para Ganado Bovino
 * Conecta con el endpoint /api/veterinario-ia (Gemini 3.8 Flash en el servidor)
 * y cuenta con motor pecuario de contingencia 100% offline si no hay señal.
 */

import { Livestock } from '../types/livestock';

export interface ConsultaIAVeterinariaParams {
  prompt: string;
  vaccineName?: string;
  animalContext?: {
    arete?: string;
    categoria?: string;
    genero?: string;
    pesoKg?: number;
    estadoReproductivo?: string;
    ubicacion?: string;
  };
}

export interface RespuestaIAVeterinaria {
  texto: string;
  fuente: 'online-gemini' | 'offline-local';
  dosisSugerida?: string;
  viaSugerida?: string;
  tiempoRetiroCarneDias?: number;
  tiempoRetiroLecheDias?: number;
  proximaFechaSugeridaDias?: number;
}

// Base de conocimiento pecuaria local de emergencia para cuando el vaquero esté en el cerro sin internet
const KNOWLEDGE_BASE_OFFLINE: Record<string, {
  dosis: string;
  via: string;
  retiroCarne: number;
  retiroLeche: number;
  refuerzoDias: number;
  info: string;
  seguridadGestacion: string;
}> = {
  derriengue: {
    dosis: '2 ml por animal (dosis fija)',
    via: 'Subcutánea o Intramuscular en la tabla del cuello',
    retiroCarne: 0,
    retiroLeche: 0,
    refuerzoDias: 365,
    info: 'Vacuna antirrábica bovina cepa ERA o similar. Obligatoria en zonas de vampiro desmodus rotundus. Revacunar anualmente antes de temporada de lluvias.',
    seguridadGestacion: 'Segura en vacas gestantes. No aplicar a animales con signos nerviosos activos.',
  },
  rabia: {
    dosis: '2 ml por animal',
    via: 'Subcutánea en la tabla del cuello',
    retiroCarne: 0,
    retiroLeche: 0,
    refuerzoDias: 365,
    info: 'Inmunización contra Rabia Paralítica Bovina. Proteger de luz solar y mantener de 2°C a 7°C.',
    seguridadGestacion: 'Segura en gestación.',
  },
  clostridiosis: {
    dosis: '5 ml por animal (primovacunación requiere refuerzo a los 21-30 días)',
    via: 'Subcutánea',
    retiroCarne: 21,
    retiroLeche: 0,
    refuerzoDias: 365,
    info: 'Protección contra carbón sintomático (mancha), edema maligno y enterotoxemia. Crucial en becerros a partir de los 2-3 meses de edad.',
    seguridadGestacion: 'Segura. Se recomienda vacunar a las vacas en el último tercio de gestación para transmitir anticuerpos calostrales al becerro.',
  },
  triple: {
    dosis: '5 ml por animal',
    via: 'Subcutánea o Intramuscular',
    retiroCarne: 21,
    retiroLeche: 0,
    refuerzoDias: 180,
    info: 'Vacuna Triple Bovina (Pasteurelosis, Carbón Sintomático y Edema Maligno). Ideal para prevenir la fiebre de embarque y neumonías.',
    seguridadGestacion: 'Segura en vacas preñadas.',
  },
  ivermectina: {
    dosis: '1 ml por cada 50 kg de peso vivo (solución al 1%) o 1 ml por 100 kg (al 3.15%)',
    via: 'Subcutánea estricta delante de la paleta',
    retiroCarne: 35,
    retiroLeche: 28,
    refuerzoDias: 90,
    info: 'Endectocida de amplio espectro contra garrapata, parásitos gastrointestinales y pulmonares. Agitar bien antes de cargar la jeringa.',
    seguridadGestacion: 'Segura en el segundo y tercer tercio. No usar en vacas en lactancia si la leche es para consumo humano inmediato.',
  },
  albendazol: {
    dosis: '1 ml por cada 10 kg de peso vivo (al 10%) o 7.5 mg/kg',
    via: 'Oral con pistola dosificadora',
    retiroCarne: 14,
    retiroLeche: 3,
    refuerzoDias: 90,
    info: 'Desparasitante oral nematodicida y fasciolicida. Muy eficaz contra parásitos pulmonares y tenias.',
    seguridadGestacion: '⚠️ PRECAUCIÓN: Contraindicado en el primer tercio de gestación (primeros 45 días) por riesgo de malformaciones.',
  },
  oxitetraciclina: {
    dosis: '1 ml por cada 10 kg de peso (L.A. 200 mg/ml)',
    via: 'Intramuscular profunda en la tabla del cuello (máx 10 ml por punto)',
    retiroCarne: 28,
    retiroLeche: 7,
    refuerzoDias: 3,
    info: 'Antibiótico de amplio espectro para neumonías, anaplasmosis, pododermatitis (gabarro) y metritis.',
    seguridadGestacion: 'Usar con criterio médico; dosis elevadas pueden manchar dientes fetales.',
  },
  vitaminas: {
    dosis: '5 ml en adultos, 2 a 3 ml en becerros y novillonas',
    via: 'Intramuscular profunda',
    retiroCarne: 0,
    retiroLeche: 0,
    refuerzoDias: 60,
    info: 'Complejo Vitamínico A, D3, E para estimular ganancia de peso, celo, fertilidad y recuperación post-parto o sequía.',
    seguridadGestacion: 'Totalmente segura y altamente recomendada en preñez.',
  },
  calcio: {
    dosis: '250 a 500 ml intravenosa lenta a temperatura corporal',
    via: 'Intravenosa lenta (yugular)',
    retiroCarne: 0,
    retiroLeche: 0,
    refuerzoDias: 1,
    info: 'Tratamiento de urgencia para fiebre de leche (hipocalcemia post-parto). Monitorear ritmo cardíaco durante la infusión.',
    seguridadGestacion: 'Para uso inmediato en vacas caídas recién paridas.',
  },
};

export async function consultarIAVeterinaria(
  params: ConsultaIAVeterinariaParams
): Promise<RespuestaIAVeterinaria> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Si hay conexión a internet, consultar Gemini 3.8 Flash en el backend
  if (isOnline) {
    try {
      const response = await fetch('/api/veterinario-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        const texto = data.response || '';

        // Extraer dosis sugerida o tiempo si se puede deducir del texto
        return {
          texto,
          fuente: 'online-gemini',
          dosisSugerida: extractDosisFromText(texto, params.animalContext?.pesoKg),
          viaSugerida: extractViaFromText(texto),
          tiempoRetiroCarneDias: extractRetiroCarne(texto),
          tiempoRetiroLecheDias: extractRetiroLeche(texto),
          proximaFechaSugeridaDias: extractRefuerzoDias(texto),
        };
      }
    } catch (err) {
      console.warn('Fallo al conectar con Gemini backend, pasando a motor pecuario offline:', err);
    }
  }

  // Motor pecuario offline local de contingencia
  return generarRespuestaOffline(params);
}

function generarRespuestaOffline(params: ConsultaIAVeterinariaParams): RespuestaIAVeterinaria {
  const query = `${params.prompt} ${params.vaccineName || ''}`.toLowerCase();
  const peso = params.animalContext?.pesoKg || 450;
  const categoria = params.animalContext?.categoria || 'bovino';

  let matchKey: string | null = null;
  if (query.includes('derriengue') || query.includes('rabia')) matchKey = 'derriengue';
  else if (query.includes('clostri') || query.includes('mancha') || query.includes('carbón') || query.includes('negra')) matchKey = 'clostridiosis';
  else if (query.includes('triple') || query.includes('pasteurel')) matchKey = 'triple';
  else if (query.includes('ivermec') || query.includes('desparasit') || query.includes('garrapata')) matchKey = 'ivermectina';
  else if (query.includes('alben') || query.includes('oral') || query.includes('fasciola')) matchKey = 'albendazol';
  else if (query.includes('oxitetra') || query.includes('antibi') || query.includes('neumo') || query.includes('gabarro')) matchKey = 'oxitetraciclina';
  else if (query.includes('vitamina') || query.includes('ade') || query.includes('flaco') || query.includes('engorda')) matchKey = 'vitaminas';
  else if (query.includes('calcio') || query.includes('caida') || query.includes('parto')) matchKey = 'calcio';

  if (matchKey && KNOWLEDGE_BASE_OFFLINE[matchKey]) {
    const item = KNOWLEDGE_BASE_OFFLINE[matchKey];
    let dosisCalculada = item.dosis;

    if (matchKey === 'ivermectina') {
      const ml = Math.round((peso / 50) * 10) / 10;
      dosisCalculada = `${ml} ml (calculado para ${peso} kg a razón de 1 ml / 50 kg)`;
    } else if (matchKey === 'oxitetraciclina') {
      const ml = Math.round((peso / 10) * 10) / 10;
      dosisCalculada = `${ml} ml L.A. (para ${peso} kg a 1 ml / 10 kg)`;
    }

    const texto = `📋 RECOMENDACIÓN VETERINARIA (Modo Local Offline):

💉 Fármaco / Biológico: ${params.vaccineName || matchKey.toUpperCase()}
⚖️ Dosis Recomendada: ${dosisCalculada}
📌 Vía de Aplicación: ${item.via}
⏱️ Tiempo de Retiro en Carne: ${item.retiroCarne} días
🥛 Tiempo de Retiro en Leche: ${item.retiroLeche} días
⚠️ Seguridad en Preñez: ${item.seguridadGestacion}
🔄 Próximo Refuerzo: Aplicar en aprox. ${item.refuerzoDias} días

ℹ️ Detalles Pecuarios:
${item.info}
Animal: ${categoria} (${peso} kg). Mantener cadena de frío de 2°C a 7°C.`;

    return {
      texto,
      fuente: 'offline-local',
      dosisSugerida: dosisCalculada,
      viaSugerida: item.via,
      tiempoRetiroCarneDias: item.retiroCarne,
      tiempoRetiroLecheDias: item.retiroLeche,
      proximaFechaSugeridaDias: item.refuerzoDias,
    };
  }

  // Respuesta genérica inteligente offline
  const texto = `📋 GUÍA GANADERA OFFLINE (Sin internet en campo):
Para la consulta: "${params.prompt}"

1. ⚖️ Dosificación General: 
   - Vacunas bovinas oficiales (Derriengue, Clostridiosis): Habitualmente dosis fijas de 2 ml o 5 ml por animal según laboratorio.
   - Desparasitantes inyectables (Ivermectina 1%): 1 ml por cada 50 kg de peso vivo vía subcutánea. Para este animal de aprox. ${peso} kg = ${(peso / 50).toFixed(1)} ml.
2. 📌 Vía recomendada: Vía subcutánea en la tabla del cuello con aguja calibre 16 o 18 x 1/2 pulgada.
3. ⚠️ Tiempo de retiro preventivo: Guardar mínimo 28 a 35 días en carne si se trata de desparasitante o antibiótico.
4. ❄️ Manejo: Conserve siempre el frasco en hielera con hielo mientras trabaja en la manga de manejo.`;

  return {
    texto,
    fuente: 'offline-local',
    dosisSugerida: `${(peso / 50).toFixed(1)} ml (estándar)`,
    viaSugerida: 'Subcutánea en tabla del cuello',
    tiempoRetiroCarneDias: 28,
    tiempoRetiroLecheDias: 0,
    proximaFechaSugeridaDias: 180,
  };
}

function extractDosisFromText(texto: string, defaultPeso?: number): string | undefined {
  const match = texto.match(/(\d+(?:\.\d+)?\s*(?:ml|cc))/i);
  if (match) return match[1];
  if (defaultPeso) {
    return `${Math.round((defaultPeso / 50) * 10) / 10} ml`;
  }
  return undefined;
}

function extractViaFromText(texto: string): string | undefined {
  const lower = texto.toLowerCase();
  if (lower.includes('subcut')) return 'Subcutánea';
  if (lower.includes('intramusc')) return 'Intramuscular';
  if (lower.includes('intraven')) return 'Intravenosa';
  if (lower.includes('oral')) return 'Oral';
  if (lower.includes('pour-on') || lower.includes('tópica')) return 'Tópica';
  return undefined;
}

function extractRetiroCarne(texto: string): number | undefined {
  const match = texto.match(/carne.*?(\d+)\s*días/i) || texto.match(/retiro.*?(\d+)\s*días/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractRetiroLeche(texto: string): number | undefined {
  const match = texto.match(/leche.*?(\d+)\s*días/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractRefuerzoDias(texto: string): number | undefined {
  const match = texto.match(/(\d+)\s*(?:días|dias)/i);
  if (match) return parseInt(match[1], 10);
  if (texto.toLowerCase().includes('anual')) return 365;
  if (texto.toLowerCase().includes('6 meses') || texto.toLowerCase().includes('semestral')) return 180;
  return 180;
}
