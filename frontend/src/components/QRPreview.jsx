import React, { useState, useEffect, useRef } from 'react';

// Composites QR + logo on a browser canvas, returns a data-URL
async function compositeQR(qrDataUrl, logoBase64, bgColor = '#ffffff') {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = img.width;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      if (logoBase64) {
        const logo = new Image();
        logo.onload = () => {
          const logoSize = Math.round(size * 0.22);
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          const pad = 6;

          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + pad, 0, Math.PI * 2);
          ctx.fillStyle = bgColor;
          ctx.fill();

          ctx.drawImage(logo, x, y, logoSize, logoSize);
          resolve(canvas.toDataURL('image/png'));
        };
        logo.onerror = () => resolve(canvas.toDataURL('image/png'));
        logo.src = logoBase64;
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.src = qrDataUrl;
  });
}

export default function QRPreview({ rawImage, logoBase64, bgColor, loading, error }) {
  const [finalImage, setFinalImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  useEffect(() => {
    if (!rawImage) { setFinalImage(null); return; }
    compositeQR(rawImage, logoBase64, bgColor).then(setFinalImage);
  }, [rawImage, logoBase64, bgColor]);

  async function handleCopy() {
    if (!finalImage) return;
    try {
      const res = await fetch(finalImage);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      await navigator.clipboard.writeText(finalImage);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!finalImage) return;
    const a = document.createElement('a');
    a.href = finalImage;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
    setDownloadMsg('Downloaded!');
    setTimeout(() => setDownloadMsg(''), 2000);
  }

  return (
    <div className="card flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-gray-800 self-start">Preview</h2>

      <div className="w-full aspect-square max-w-[280px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Generating...</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm text-red-600 font-medium">Generation Failed</p>
          </div>
        )}
        {!loading && !error && finalImage && (
          <img src={finalImage} alt="Generated QR Code" className="w-full h-full object-contain p-2" />
        )}
        {!loading && !error && !finalImage && (
          <div className="flex flex-col items-center gap-2 text-gray-400 text-center px-4">
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <p className="text-sm">Your QR code will appear here</p>
            <p className="text-xs">Fill in the form and click Generate</p>
          </div>
        )}
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm font-medium text-red-700 mb-1">Please fix the following:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {(Array.isArray(error) ? error : [error]).map((e, i) => (
              <li key={i} className="text-sm text-red-600">{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 w-full">
        <button className="btn-secondary" disabled={!finalImage || loading} onClick={handleDownload}>
          {downloadMsg ? '✅' : '⬇️'} {downloadMsg || 'Download PNG'}
        </button>
        <button className="btn-secondary" disabled={!finalImage || loading} onClick={handleCopy}>
          {copied ? '✅' : '📋'} {copied ? 'Copied!' : 'Copy Image'}
        </button>
      </div>

      {finalImage && (
        <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Quick tips:</p>
          <p>• Always scan &amp; test before printing</p>
          <p>• Minimum print size: 2cm × 2cm</p>
          <p>• Keep QR code square — never stretch</p>
        </div>
      )}
    </div>
  );
}
