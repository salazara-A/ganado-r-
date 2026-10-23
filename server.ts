import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Inicialización del cliente Gemini en el servidor con header requerido
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Endpoint de IA Veterinaria Especializada en Ganado Bovino y Vacunas
  app.post('/api/veterinario-ia', async (req, res) => {
    try {
      const { prompt, animalContext, vaccineName } = req.body;

      if (!prompt && !vaccineName) {
        return res.status(400).json({ error: 'Se requiere una consulta o medicamento para la IA.' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'Servicio de IA no configurado en el servidor (GEMINI_API_KEY no detectada).',
        });
      }

      const systemInstruction = `Eres "VetGanado IA", un Médico Veterinario Zootecnista (MVZ) especialista en bovinos de carne y leche en México y Latinoamérica.
Tu función principal es asesorar a ganaderos, vaqueros y productores sobre:
1. Vacunas bovinas (Derriengue/Rabia, Clostridiosis/Mancha, Triple Bovina, Brucelosis, IBR, DVB, Leptospirosis, Neumonías).
2. Dosis precisas calculadas por peso vivo (kg) o dosis fijas oficiales por animal.
3. Vía exacta de aplicación (Subcutánea, Intramuscular profunda, Intravenosa, Pour-on tópica, Oral).
4. Tiempos de retiro obligatorio en leche y carne para evitar contaminaciones y multas de sanidad pecuaria.
5. Advertencias en hembras gestantes (si produce abortos o si es seguro en el último tercio de gestación).
6. Protocolos para becerros recién nacidos, al destete, novillonas y sementales.
7. Manejo de cadena de frío de biológicos y qué hacer ante reacciones adversas (choque anafiláctico con epinefrina).

Formato de respuesta:
- Sé directo, práctico y en lenguaje claro para el trabajo de rancho y campo.
- Incluye siempre:
  • 💉 Nombre de la vacuna / biológico / medicamento
  • ⚖️ Dosis exacta recomendada (en ml/cc) según el peso indicado
  • 📌 Vía y zona de inyección recomendada (ej. tabla del cuello, subcutánea)
  • ⏱️ Tiempo de Retiro (Días en Carne y Días en Leche)
  • ⚠️ Contraindicaciones y seguridad en preñez / gestación
  • 🔄 Próximo refuerzo o revacunación sugerida (en meses o días)
- Responde siempre en español.`;

      let userQuery = prompt || '';
      if (vaccineName) {
        userQuery = `Consulta sobre el medicamento o vacuna: "${vaccineName}". ${prompt || 'Indica dosis exacta, vía, tiempo de retiro y advertencias.'}`;
      }

      let contextStr = '';
      if (animalContext) {
        contextStr = `\n\nDATOS DEL ANIMAL EN EL RANCHO:
- Arete: ${animalContext.arete || 'Sin arete'}
- Categoría: ${animalContext.categoria || 'Bovino'}
- Género: ${animalContext.genero || 'No especificado'}
- Peso aprox: ${animalContext.pesoKg ? `${animalContext.pesoKg} kg` : 'Adulto estándar'}
- Estado reproductivo: ${animalContext.estadoReproductivo || 'Normal'}
- Ubicación: ${animalContext.ubicacion || 'Potrero'}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${userQuery}${contextStr}`,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({
        response: response.text || 'Sin respuesta detallada del asistente pecuario.',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error en /api/veterinario-ia:', err);
      return res.status(500).json({
        error: err.message || 'Error en el servidor al consultar la IA Veterinaria.',
      });
    }
  });

  // Modo desarrollo con Vite middlewares o estático en producción
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GanadoPro Server activo en puerto ${PORT}`);
  });
}

startServer();
