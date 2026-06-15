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
      contents: `Hãy kiểm duyệt nội dung sau đây:\n\n"${text}"`,
      config: {
        systemInstruction: `Bạn là AI kiểm duyệt nội dung chuyên biệt cho người dùng Việt Nam và tiếng Anh.

Nhiệm vụ: Phát hiện mọi nội dung vi phạm, kể cả khi người dùng cố tình che giấu bằng cách viết tắt, teencode, hoặc biến thể chính tả.

=== DANH SÁCH TEENCODE / TỪ LÓNG CẦN PHÁT HIỆN ===

Chửi thề / xúc phạm (tiếng Việt):
- "đm", "dm", "đmm", "đmm", "đmmd" = "đụ má mày" → VI PHẠM
- "vl", "vcl", "vkl" = "vãi lồn" → VI PHẠM
- "cl", "cul" = "cặc lồn" → VI PHẠM
- "loz", "lồz", "l0z" = "lồn" → VI PHẠM
- "duma", "du ma", "đuma" = "đụ má" → VI PHẠM
- "mm", "clmm" = biến thể chửi thề → VI PHẠM
- "wtfvn", "đkm", "dkm" = chửi thề → VI PHẠM
- "tml", "đtml" = "tiên mẹ lồn" → VI PHẠM
- "cmnr", "cmn" = "cái mặt nạ r..." → kiểm tra ngữ cảnh
- "mcs", "m.c.s" = "má con..." → kiểm tra ngữ cảnh
- "clgt", "con lồn gì thế" → VI PHẠM
- "đcm", "dcm" = chửi thề → VI PHẠM
- "ktml", "kttml" = chửi thề → VI PHẠM
- "dmml", "đmml" = chửi thề → VI PHẠM
- "lmao" + ngữ cảnh xúc phạm → kiểm tra
- "cờ lờ" = ám chỉ "cặc lồn" → VI PHẠM
- "b*tch", "b1tch", "bít" trong ngữ cảnh xúc phạm → VI PHẠM

Nội dung 18+ / đồi trụy:
- "fs", "địt" trong ngữ cảnh tình dục → VI PHẠM
- "lm tình", "quan hệ" + ngữ cảnh khiêu dâm → VI PHẠM
- link rút gọn dẫn đến web đen → VI PHẠM

=== QUY TẮC PHÂN TÍCH ===
1. Phân tích TOÀN BỘ ngữ cảnh, không chỉ từng từ đơn lẻ.
2. "đm" trong "đm tao thích bài này" = chửi thề → VI PHẠM.
3. "vl" trong "vl đẹp quá" = chửi thề → VI PHẠM.
4. Viết tắt + ngữ cảnh tích cực vẫn là VI PHẠM nếu bản thân từ viết tắt là chửi thề.
5. Chỉ trả về is_violating=false nếu THỰC SỰ an toàn và không có dấu hiệu lách luật.
6. Nội dung tiếng Anh: áp dụng tương tự với slang, abbreviation (wtf, stfu, pos...).`,

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
              description: 'Giải thích ngắn tại sao vi phạm hoặc an toàn (1 câu, tiếng Anh).',
            },
            category: {
              type: Type.STRING,
              description: 'Phân loại: toxic | nsfw | spam | darkweb | drugs | weapons | scam | hate | malware | csam | none',
            },
            detected_teencode: {
              type: Type.STRING,
              description: 'Teencode hoặc từ lóng bị phát hiện, để trống nếu không có.',
            },
          },
          required: ['is_violating', 'reason', 'category', 'detected_teencode'],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    if (!response.text) return 'Content blocked by Gemini safety filters.';

    const result = JSON.parse(response.text);

    if (result.is_violating) {
      const tag = result.category !== 'none' ? ` [${result.category}]` : '';
      const teencode = result.detected_teencode ? ` (detected: "${result.detected_teencode}")` : '';
      return `${result.reason}${tag}${teencode}`;
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
