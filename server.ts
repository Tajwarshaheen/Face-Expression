import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support base64 image payloads up to 25MB
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MoodVision AI Engine',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Facial expression analysis endpoint
  app.post('/api/analyze-expression', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          success: false,
          error: 'Gemini API Key is not configured on the server. Please check the Secrets panel in AI Studio.',
        });
      }

      const { image, mimeType = 'image/jpeg' } = req.body;
      if (!image) {
        return res.status(400).json({
          success: false,
          error: 'No image data provided for analysis.',
        });
      }

      // Handle data URL prefix or raw base64
      let base64Data = image;
      let detectedMimeType = mimeType;

      const dataUrlMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (dataUrlMatch) {
        detectedMimeType = dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are MoodVision AI, an objective computer vision and facial expression analysis specialist.
Examine the supplied image carefully to detect visible human faces and estimate facial expression probabilities according to Paul Ekman's 7 universal facial expressions:
1. Happy
2. Sad
3. Neutral
4. Angry
5. Surprised
6. Fearful
7. Disgusted

INSTRUCTIONS:
1. Check if one or more clear human faces are visible in the photo.
2. If NO human face is clearly detected (e.g., photo of objects, scenery, animals, abstract graphics, or completely occluded/blurred faces):
   - Set "faceDetected": false
   - Set "faceCount": 0
   - Set "faces": []
   - Set "overallSummary": "No face detected. Please upload another photograph."
   - Set "disclaimer": "These results represent AI-estimated visible facial expressions and do not determine a person's actual emotional state."
3. If human faces ARE detected:
   - Set "faceDetected": true
   - Set "faceCount": total detected faces count.
   - For each detected face (up to 4 prominent faces):
     * "faceId": number (1, 2, ...)
     * "boundingBoxDescription": e.g. "Primary front-facing subject", "Left profile face", "Background right face"
     * "dominantExpression": Exactly one of "Happy", "Sad", "Neutral", "Angry", "Surprised", "Fearful", "Disgusted" (the expression with highest percentage).
     * "expressions": Object containing integer probability percentages (0 to 100) for all 7 expressions: happy, sad, neutral, angry, surprised, fearful, disgusted. The values must sum to approximately 100.
     * "confidence": detection confidence percentage (0 to 100).
     * "visibleCues": Array of 2 to 4 observable anatomical cues/action units (e.g., "Lip corners drawn upward (zygomaticus major)", "Relaxed brow ridge", "Narrowed eye aperture", "Downward lip curve").
     * "summary": Single concise summary sentence (e.g., "Your image shows a predominantly happy facial expression.").
   - Set "overallSummary": Concise multi-face overview or overall image expression summary.
   - Set "disclaimer": "These results represent AI-estimated visible facial expressions and do not determine a person's actual emotional state."`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: detectedMimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              faceDetected: {
                type: Type.BOOLEAN,
                description: 'True if at least one human face is visible and detected.',
              },
              faceCount: {
                type: Type.INTEGER,
                description: 'Total number of detected human faces.',
              },
              overallSummary: {
                type: Type.STRING,
                description: 'Overall summary of the facial expression analysis.',
              },
              disclaimer: {
                type: Type.STRING,
                description: 'Mandatory disclaimer statement regarding estimated expressions vs actual feelings.',
              },
              faces: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    faceId: { type: Type.INTEGER },
                    boundingBoxDescription: { type: Type.STRING },
                    dominantExpression: { type: Type.STRING },
                    confidence: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    visibleCues: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    expressions: {
                      type: Type.OBJECT,
                      properties: {
                        happy: { type: Type.INTEGER },
                        sad: { type: Type.INTEGER },
                        neutral: { type: Type.INTEGER },
                        angry: { type: Type.INTEGER },
                        surprised: { type: Type.INTEGER },
                        fearful: { type: Type.INTEGER },
                        disgusted: { type: Type.INTEGER },
                      },
                      required: ['happy', 'sad', 'neutral', 'angry', 'surprised', 'fearful', 'disgusted'],
                    },
                  },
                  required: ['faceId', 'dominantExpression', 'confidence', 'summary', 'visibleCues', 'expressions'],
                },
              },
            },
            required: ['faceDetected', 'faceCount', 'overallSummary', 'disclaimer', 'faces'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(502).json({
          success: false,
          error: 'Empty response received from AI model.',
        });
      }

      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error in /api/analyze-expression:', err);
      const errorMessage = err?.message || 'Failed to analyze facial expression.';
      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Serve static files or Vite dev middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
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
    console.log(`MoodVision AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
