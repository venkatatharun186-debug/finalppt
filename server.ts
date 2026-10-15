import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SUPPORTED_LANGUAGES } from './src/languages';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const apiKeyPresent = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    geminiReady: apiKeyPresent,
    model: 'gemini-3.1-flash-lite',
    timestamp: new Date().toISOString()
  });
});

// Languages endpoint
app.get('/api/languages', (_req: Request, res: Response) => {
  res.json(SUPPORTED_LANGUAGES);
});

// Multimodal Vision Assist endpoint
app.post('/api/vision-assist', async (req: Request, res: Response) => {
  try {
    const { imageBase64, language = 'en', task = 'obstacle_safety', query } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'imageBase64 is required' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      // Graceful fallback if API key is not yet set
      res.json({
        success: true,
        data: {
          summary: 'Path ahead detected. Connect GEMINI_API_KEY in settings to enable live AI vision.',
          navigationAdvice: 'Proceed forward with standard caution.',
          audioAlert: 'Path is clear. Please configure GEMINI_API_KEY for advanced vision recognition.',
          pathClear: true,
          urgentHazards: [],
          detectedText: '',
          sceneContext: 'Simulated environment',
          obstacles: [
            {
              id: 'obs_1',
              label: 'Walkway center',
              isHazard: false,
              severity: 'low',
              distance: '2 meters',
              location: 'center',
              box2d: [400, 300, 800, 700]
            }
          ]
        }
      });
      return;
    }

    // Determine MIME type and clean Base64 data
    let mimeType = 'image/jpeg';
    let cleanBase64 = imageBase64;

    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
      cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.-]+;base64,/, '');
    } else if (imageBase64.startsWith('data:image/svg+xml')) {
      // If raw SVG string passed without rasterization, convert string to base64 or fallback
      cleanBase64 = Buffer.from(imageBase64).toString('base64');
      mimeType = 'image/png';
    }

    // Target language metadata
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

    let taskInstruction = `You are Drishti, an assistive vision & navigation AI for visually impaired and low-vision users.
Analyze this camera image with extreme attention to pedestrian safety, physical obstacles, floor changes, and navigation pathways.
Translate and output all natural language fields (summary, navigationAdvice, audioAlert, urgentHazards, obstacle labels) directly into ${langObj.name} (${langObj.nativeName}).

Tasks guidelines:
1. Obstacle Detection: Identify any physical hazards, drop-offs, stairs, curbs, poles, moving vehicles, boxes, bicycles, low-hanging signs, or objects on the ground.
2. Coordinates: For each obstacle, provide normalized bounding box [ymin, xmin, ymax, xmax] on a 0 to 1000 scale.
3. Audio Alert: Generate a short, punchy sentence (under 15 words) suitable to be read out immediately through speech synthesis.
4. If task is 'read_text', specifically transcribe any visible road signs, medical labels, menus, or door numbers in detectedText.
5. If task is 'currency_reader', detect banknotes, denominations, coins, and authenticity features.`;

    if (query) {
      taskInstruction += `\nUser asked specifically: "${query}". Address this in your advice and summary.`;
    }

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: `Concise description of the scene in ${langObj.name}.`,
          },
          navigationAdvice: {
            type: Type.STRING,
            description: `Clear directions (e.g. stop, shift left, step up) in ${langObj.name}.`,
          },
          audioAlert: {
            type: Type.STRING,
            description: `Urgent or status audio sentence to speak out loud in ${langObj.name}.`,
          },
          pathClear: {
            type: Type.BOOLEAN,
            description: 'Whether the immediate forward walking path is safe and free of obstructions.',
          },
          urgentHazards: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of critical immediate safety risks.',
          },
          detectedText: {
            type: Type.STRING,
            description: 'Any legible text, signs, labels, or numbers in the image.',
          },
          sceneContext: {
            type: Type.STRING,
            description: 'Setting type (e.g. sidewalk, indoor stairs, crosswalk, room, clinic).',
          },
          obstacles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                isHazard: { type: Type.BOOLEAN },
                severity: { type: Type.STRING, description: 'low, medium, high, or critical' },
                distance: { type: Type.STRING, description: 'e.g. 1m ahead, immediate, 3m left' },
                location: { type: Type.STRING, description: 'left, center, right, ground, or overhead' },
                box2d: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                  description: '[ymin, xmin, ymax, xmax] 0-1000 scale',
                },
              },
              required: ['id', 'label', 'isHazard', 'severity', 'distance', 'location', 'box2d'],
            },
          },
        },
        required: ['summary', 'navigationAdvice', 'audioAlert', 'pathClear', 'urgentHazards', 'obstacles'],
      },
    };

    // Try primary models: gemini-3.1-flash-lite (high efficiency, active quota)
    let responseText = '';
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    let lastError: unknown = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: taskInstruction,
              },
            ],
          },
          config: schemaConfig,
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next:`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All vision models failed to return content');
    }

    const parsed = JSON.parse(responseText);
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: unknown) {
    console.error('Vision assist error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown vision assist error';
    res.status(500).json({ success: false, error: msg });
  }
});

// Conversational Q&A / Voice Assistant endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, imageBase64, language = 'en', history = [] } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'message is required' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({
        success: true,
        reply: `I received your question: "${message}". Please configure GEMINI_API_KEY to activate conversational AI intelligence.`,
        spokenSummary: 'API key required for full live AI conversation.',
      });
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

    if (imageBase64) {
      let mimeType = 'image/jpeg';
      let cleanBase64 = imageBase64;
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
        cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.-]+;base64,/, '');
      }
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const conversationContext = history
      .slice(-6)
      .map((h: { role: string; text: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
      .join('\n');

    const prompt = `You are Drishti, an assistive voice and vision AI companion.
You are helping someone navigate, perceive their surroundings, read items, and stay safe.
Always respond in ${langObj.name} (${langObj.nativeName}).
Keep your answers concise, practical, reassuring, and easy to understand via voice.

Previous conversation context:
${conversationContext || 'None'}

Current user question:
"${message}"

Return a JSON object with:
1. "reply": detailed answer formatted clearly in ${langObj.name}.
2. "spokenSummary": concise 1-2 sentence spoken version for immediate speech readout.`;

    parts.push({ text: prompt });

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          spokenSummary: { type: Type.STRING },
        },
        required: ['reply', 'spokenSummary'],
      },
    };

    let responseText = '';
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: unknown = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: schemaConfig,
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Chat generation failed');
    }

    const parsed = JSON.parse(responseText);
    res.json({
      success: true,
      reply: parsed.reply || 'I am here to help you navigate safely.',
      spokenSummary: parsed.spokenSummary || parsed.reply || 'How can I assist you?',
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown chat error';
    res.status(500).json({ success: false, error: msg });
  }
});

// Text-to-Speech endpoint powered by Gemini 3.8 Flash Lite TTS with graceful fallback
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Zephyr', language = 'en' } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: 'text is required' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({
        success: false,
        fallbackToBrowser: true,
        message: 'GEMINI_API_KEY not configured, falling back to client synthesis',
      });
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

    // Gemini 3.8 Flash Lite TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500),
              speechMetadata: {
                style: `Helpful, warm, clear assistive voice for a navigation and vision assistant in ${langObj.name}`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || langObj.voice || 'Zephyr',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.json({ success: false, fallbackToBrowser: true, message: 'No audio returned from Gemini TTS' });
      return;
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: unknown) {
    console.warn('TTS error, falling back to browser speech:', error);
    res.json({
      success: false,
      fallbackToBrowser: true,
      error: error instanceof Error ? error.message : 'TTS failure',
    });
  }
});

// Start server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Drishti Voice & Vision AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
