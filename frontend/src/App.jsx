import React, { useState } from 'react';
import ContentTypeSelector from './components/ContentTypeSelector';
import ContentForm from './components/ContentForm';
import CustomizationPanel from './components/CustomizationPanel';
import QRPreview from './components/QRPreview';

const DEFAULT_OPTIONS = {
  size: 300,
  color: '#003087',
  bgColor: '#ffffff',
  logoBase64: null,
};

export default function App() {
  const [type, setType] = useState('url');
  const [data, setData] = useState({});
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'customize'

  function handleTypeChange(newType) {
    setType(newType);
    setData({});
    setQrImage(null);
    setError(null);
  }

  function handleLogoChange(base64) {
    setOptions((prev) => ({ ...prev, logoBase64: base64 }));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setQrImage(null);
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, options }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.errors || ['Unknown error']);
      } else {
        setQrImage(json.image);
      }
    } catch {
      setError(['Could not reach the server. Make sure the backend is running on port 3001.']);
    } finally {
      setLoading(false);
    }
  }

  const TYPE_LABELS = {
    url: 'URL', text: 'Text', email: 'Email', phone: 'Phone', wifi: 'WiFi',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-hsb-blue text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            ▣
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">QR Code Generator</h1>
            <p className="text-blue-200 text-xs">Create branded QR codes in seconds</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Content type */}
            <div className="card">
              <ContentTypeSelector selected={type} onChange={handleTypeChange} />
            </div>

            {/* Tabs: Content / Customize */}
            <div className="card space-y-4">
              <div className="flex border-b border-gray-100 -mx-6 -mt-6 px-6 pt-4 mb-4">
                {['content', 'customize'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors capitalize
                      ${activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab === 'content' ? `Content (${TYPE_LABELS[type]})` : 'Customize'}
                  </button>
                ))}
              </div>

              {activeTab === 'content' && (
                <ContentForm
                  type={type}
                  data={data}
                  onChange={setData}
                  fieldErrors={null}
                />
              )}

              {activeTab === 'customize' && (
                <CustomizationPanel
                  options={options}
                  onChange={setOptions}
                  onLogoChange={handleLogoChange}
                />
              )}

              <button
                className="btn-primary mt-2"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating...' : '▣  Generate QR Code'}
              </button>
            </div>

            {/* Use cases */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-700 mb-3">Common Use Cases</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🎟️', label: 'Event Registration', tip: 'Link to registration forms' },
                  { icon: '📶', label: 'Guest WiFi',         tip: 'Share credentials easily' },
                  { icon: '📋', label: 'Feedback Survey',    tip: 'Link to Google Forms' },
                  { icon: '🗺️', label: 'Campus Navigation',  tip: 'Building / room directions' },
                  { icon: '📚', label: 'Course Materials',   tip: 'Link to reading resources' },
                  { icon: '💼', label: 'Business Card',      tip: 'Personal contact details' },
                ].map((uc) => (
                  <div key={uc.label} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <span className="text-lg">{uc.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{uc.label}</p>
                      <p className="text-xs text-gray-400">{uc.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <QRPreview
                rawImage={qrImage}
                logoBase64={options.logoBase64}
                bgColor={options.bgColor}
                loading={loading}
                error={error}
              />

              {/* Current settings summary */}
              <div className="card mt-4 text-xs text-gray-500 space-y-1.5">
                <p className="font-semibold text-gray-700 text-sm">Current Settings</p>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-gray-700">{TYPE_LABELS[type]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size</span>
                  <span className="font-medium text-gray-700">{options.size}×{options.size}px</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>QR Color</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-200 inline-block" style={{ background: options.color }} />
                    <span className="font-mono font-medium text-gray-700">{options.color}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Background</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-200 inline-block" style={{ background: options.bgColor }} />
                    <span className="font-mono font-medium text-gray-700">{options.bgColor}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Logo</span>
                  <span className="font-medium text-gray-700">{options.logoBase64 ? 'Uploaded ✓' : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Correction</span>
                  <span className="font-medium text-gray-700">High (H) — logo safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        QR Code Generator · Built with React + Express · Error correction level H for logo support
      </footer>
    </div>
  );
}
