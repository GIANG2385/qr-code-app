import React from 'react';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ContentForm({ type, data, onChange, fieldErrors }) {
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  if (type === 'url') {
    return (
      <Field label="Website URL" error={fieldErrors?.url}>
        <input
          className="input"
          type="url"
          placeholder="https://example.com"
          value={data.url || ''}
          onChange={set('url')}
        />
      </Field>
    );
  }

  if (type === 'text') {
    return (
      <Field label={`Text Content (${(data.text || '').length}/900)`} error={fieldErrors?.text}>
        <textarea
          className="input resize-none"
          rows={4}
          placeholder="Enter your message here... (Vietnamese supported)"
          maxLength={900}
          value={data.text || ''}
          onChange={set('text')}
        />
      </Field>
    );
  }

  if (type === 'email') {
    return (
      <Field label="Email Address" error={fieldErrors?.email}>
        <input
          className="input"
          type="email"
          placeholder="contact@example.com"
          value={data.email || ''}
          onChange={set('email')}
        />
      </Field>
    );
  }

  if (type === 'phone') {
    return (
      <Field label="Phone Number" error={fieldErrors?.phone}>
        <input
          className="input"
          type="tel"
          placeholder="+84 123 456 789"
          value={data.phone || ''}
          onChange={set('phone')}
        />
        <p className="text-gray-400 text-xs mt-1">Include country code for international numbers (e.g. +84)</p>
      </Field>
    );
  }

  if (type === 'wifi') {
    return (
      <div className="space-y-3">
        <Field label="Network Name (SSID)" error={fieldErrors?.ssid}>
          <input
            className="input"
            placeholder="MyWiFiNetwork"
            value={data.ssid || ''}
            onChange={set('ssid')}
          />
        </Field>
        <Field label="Security Type" error={null}>
          <select
            className="input"
            value={data.security || 'WPA'}
            onChange={set('security')}
          >
            <option value="WPA">WPA / WPA2 (Recommended)</option>
            <option value="WEP">WEP (Legacy)</option>
            <option value="nopass">No Password (Open)</option>
          </select>
        </Field>
        {(data.security || 'WPA') !== 'nopass' && (
          <Field label="Password" error={fieldErrors?.password}>
            <input
              className="input"
              type="password"
              placeholder="Network password"
              value={data.password || ''}
              onChange={set('password')}
            />
          </Field>
        )}
        <Field label="Hidden Network?" error={null}>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={data.hidden || false}
              onChange={(e) => onChange({ ...data, hidden: e.target.checked })}
            />
            This is a hidden network
          </label>
        </Field>
      </div>
    );
  }

  return null;
}
