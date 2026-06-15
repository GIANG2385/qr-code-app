require('dotenv').config();
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { runContentFilter } = require('./filters');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── AI Moderation (Gemini structured JSON + Safety Settings) ────────────────

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
];

async function geminiModerate(text) {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const { GoogleGenAI, Type } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Hãy kiểm duyệt nội dung sau: "${text}"`,
      config: {
        systemInstruction:
          'Bạn là AI kiểm duyệt nội dung đa ngôn ngữ. Phân tích nội dung và xác định xem có vi phạm tiêu chuẩn cộng đồng hay không, bao gồm: bạo lực, xúc phạm, đồi trụy, spam, dark web, ma túy, vũ khí, lừa đảo, ngôn từ thù địch, phần mềm độc hại, hoặc nội dung gây hại cho trẻ em.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_violating: {
              type: Type.BOOLEAN,
              description: 'True nếu vi phạm, False nếu an toàn.',
            },
            reason: {
              type: Type.STRING,
              description: 'Lý do ngắn gọn nếu vi phạm (bằng tiếng Anh).',
            },
            category: {
              type: Type.STRING,
              description: 'Phân loại: spam | toxic | nsfw | darkweb | drugs | weapons | scam | hate | malware | csam | none',
            },
          },
          required: ['is_violating', 'reason', 'category'],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    if (!response.text) return 'Content blocked by Gemini safety filters.';

    const result = JSON.parse(response.text);

    if (result.is_violating) {
      const category = result.category !== 'none' ? ` [${result.category}]` : '';
      return `${result.reason}${category}`;
    }
    return null;

  } catch (err) {
    if (err?.message?.includes('SAFETY')) return 'Content blocked by Gemini safety filters.';
    console.error('Gemini moderation error:', err?.message);
    return null;
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateContent(type, data) {
  const errors = [];

  switch (type) {
    case 'url':
      if (!data.url?.trim()) {
        errors.push('URL is required.');
      } else if (!/^https?:\/\/.+\..+/.test(data.url.trim())) {
        errors.push('URL must start with http:// or https:// and be a valid address.');
      }
      break;
    case 'text':
      if (!data.text?.trim()) {
        errors.push('Text content is required.');
      } else if (data.text.trim().length > 900) {
        errors.push('Text must be under 900 characters.');
      }
      break;
    case 'email':
      if (!data.email?.trim()) {
        errors.push('Email address is required.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.push('Please enter a valid email address.');
      }
      break;
    case 'phone':
      if (!data.phone?.trim()) {
        errors.push('Phone number is required.');
      } else if (!/^\+?[\d\s\-()+]{7,20}$/.test(data.phone.trim())) {
        errors.push('Please enter a valid phone number (7–20 digits, may include +, spaces, dashes).');
      }
      break;
    case 'wifi':
      if (!data.ssid?.trim()) errors.push('Network name (SSID) is required.');
      if (data.security !== 'nopass' && !data.password?.trim()) {
        errors.push('Password is required for secured networks.');
      }
      if (data.ssid && data.ssid.trim().length > 32) {
        errors.push('SSID must be 32 characters or fewer.');
      }
      break;
    default:
      errors.push('Invalid content type.');
  }

  return errors;
}

function buildQRContent(type, data) {
  switch (type) {
    case 'url':   return data.url.trim();
    case 'text':  return data.text.trim();
    case 'email': return `mailto:${data.email.trim()}`;
    case 'phone': return `tel:${data.phone.trim().replace(/\s/g, '')}`;
    case 'wifi': {
      const security = data.security || 'WPA';
      const ssid = data.ssid.trim().replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/"/g, '\\"');
      const pass = (data.password || '').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/"/g, '\\"');
      return `WIFI:T:${security};S:${ssid};P:${pass};;`;
    }
    default: return '';
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/generate', async (req, res) => {
  try {
    const { type, data = {}, options = {} } = req.body;

    const errors = validateContent(type, data);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const content = buildQRContent(type, data);

    const sampleText = type === 'wifi' ? data.ssid : content;
    const urlForCheck = type === 'url' ? data.url : null;

    // Layer 1: fast keyword/pattern filter
    const filterResult = runContentFilter(sampleText, urlForCheck);
    if (filterResult) {
      return res.status(400).json({ success: false, errors: [filterResult] });
    }

    // Layer 2: AI moderation (Gemini) — catches context the keyword list misses
    const aiReason = await geminiModerate(sampleText);
    if (aiReason) {
      return res.status(400).json({ success: false, errors: [`AI moderation: ${aiReason}`] });
    }

    const { size = 300, color = '#000000', bgColor = '#ffffff' } = options;

    // Generate QR as base64 PNG — logo overlay is handled client-side
    const image = await QRCode.toDataURL(content, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: color, light: bgColor },
    });

    res.json({ success: true, image, content });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ success: false, errors: ['Server error while generating QR code.'] });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`QR backend running at http://localhost:${PORT}`));
