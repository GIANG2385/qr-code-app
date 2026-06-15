import React from 'react';

const TYPES = [
  { id: 'url',   label: 'URL',   icon: '🌐' },
  { id: 'text',  label: 'Text',  icon: '📝' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'wifi',  label: 'WiFi',  icon: '📶' },
];

export default function ContentTypeSelector({ selected, onChange }) {
  return (
    <div>
      <p className="label">Content Type</p>
      <div className="grid grid-cols-5 gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all
              ${selected === t.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
