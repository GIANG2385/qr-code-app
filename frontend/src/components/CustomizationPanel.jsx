import React, { useRef } from 'react';

const SIZE_OPTIONS = [
  { value: 150, label: '150×150', hint: 'Small / Digital' },
  { value: 200, label: '200×200', hint: 'Business Card' },
  { value: 300, label: '300×300', hint: 'Standard' },
  { value: 400, label: '400×400', hint: 'Poster' },
  { value: 500, label: '500×500', hint: 'Large Print' },
];

const COLOR_PRESETS = [
  { name: 'HSB Blue',    dark: '#003087', light: '#ffffff' },
  { name: 'HSB Red',     dark: '#C8102E', light: '#ffffff' },
  { name: 'Classic',     dark: '#000000', light: '#ffffff' },
  { name: 'Navy',        dark: '#1B2A6B', light: '#ffffff' },
  { name: 'Forest',      dark: '#1B5E20', light: '#ffffff' },
  { name: 'Purple',      dark: '#4A148C', light: '#ffffff' },
  { name: 'Midnight',    dark: '#0D1B2A', light: '#E8F4FD' },
  { name: 'Amber',       dark: '#E65100', light: '#FFFDE7' },
];

export default function CustomizationPanel({ options, onChange, onLogoChange }) {
  const fileRef = useRef(null);

  const set = (key) => (val) => onChange({ ...options, [key]: val });

  function handlePreset(preset) {
    onChange({ ...options, color: preset.dark, bgColor: preset.light });
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLogoChange(ev.target.result);
    reader.readAsDataURL(file);
  }

  const activePreset = COLOR_PRESETS.find(
    (p) => p.dark === options.color && p.light === options.bgColor
  );

  return (
    <div className="space-y-5">
      {/* Size */}
      <div>
        <p className="label">Output Size</p>
        <div className="grid grid-cols-5 gap-1.5">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => set('size')(s.value)}
              title={s.hint}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-all
                ${options.size === s.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-1">
          Hint: {SIZE_OPTIONS.find((s) => s.value === options.size)?.hint}
        </p>
      </div>

      {/* Color Presets */}
      <div>
        <p className="label">Color Preset</p>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePreset(preset)}
              title={preset.name}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all
                ${activePreset?.name === preset.name
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-400'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <span
                className="w-4 h-4 rounded-sm flex-shrink-0 border border-gray-200"
                style={{ background: preset.dark }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <p className="label">Custom Colors</p>
        <div className="flex gap-3">
          <label className="flex-1">
            <span className="text-xs text-gray-500 block mb-1">QR Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={options.color}
                onChange={(e) => set('color')(e.target.value)}
                className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={options.color}
                maxLength={7}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set('color')(e.target.value);
                }}
                className="input flex-1 font-mono text-sm"
              />
            </div>
          </label>
          <label className="flex-1">
            <span className="text-xs text-gray-500 block mb-1">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => set('bgColor')(e.target.value)}
                className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={options.bgColor}
                maxLength={7}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set('bgColor')(e.target.value);
                }}
                className="input flex-1 font-mono text-sm"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <p className="label">Logo (optional)</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary flex-none w-auto px-4"
          >
            📁 Upload Logo
          </button>
          {options.logoBase64 && (
            <>
              <img
                src={options.logoBase64}
                alt="logo preview"
                className="w-10 h-10 object-contain rounded border border-gray-200 bg-white"
              />
              <button
                onClick={() => onLogoChange(null)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <p className="text-gray-400 text-xs mt-1">PNG/SVG with transparent background works best.</p>
      </div>
    </div>
  );
}
