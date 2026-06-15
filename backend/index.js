require('dotenv').config();
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── Content Filtering ────────────────────────────────────────────────────────

const NSFW_KEYWORDS = [
  'porn', 'xxx', 'adult content', 'nude', 'naked', 'nsfw',
  'explicit', 'erotic', 'hentai', 'onlyfans',
];

function basicFilter(text) {
  const lower = text.toLowerCase();
  return NSFW_KEYWORDS.some((kw) => lower.includes(kw));
}

async function geminiModerate(text) {
  if (!process.env.GEMINI_API_KEY) return false;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Is the following content inappropriate, NSFW, harmful, or illegal? Reply ONLY with "yes" or "no".\n\nContent: ${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase().startsWith('yes');
  } catch {
    return false;
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
    if (basicFilter(sampleText)) {
      return res.status(400).json({ success: false, errors: ['Content contains inappropriate material.'] });
    }
    const flagged = await geminiModerate(sampleText);
    if (flagged) {
      return res.status(400).json({ success: false, errors: ['Content was flagged as inappropriate by AI moderation.'] });
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

// Local dev server — Vercel uses the exported app directly
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`QR backend running at http://localhost:${PORT}`));
}

module.exports = app;
