'use client';
import { useState, useEffect } from 'react';

interface RetentionSettings {
  retainDays: number;
}

export default function EmailRetentionSettings() {
  const [settings, setSettings] = useState<RetentionSettings>({ retainDays: 14 });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retentionOptions = [
    { value: 7, label: '1 week', description: 'Emails older than 7 days will be archived' },
    { value: 14, label: '2 weeks', description: 'Emails older than 14 days will be archived (Default)' },
    { value: 30, label: '1 month', description: 'Emails older than 30 days will be archived' },
    { value: 60, label: '2 months', description: 'Emails older than 60 days will be archived' },
    { value: 90, label: '3 months', description: 'Emails older than 90 days will be archived' },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          📦 Email Retention Settings
        </h3>
        <p className="text-gray-600">
          Configure how long emails stay active before being automatically archived
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Email Retention Period
          </label>
          <div className="space-y-2">
            {retentionOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.retainDays === option.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="retainDays"
                  value={option.value}
                  checked={settings.retainDays === option.value}
                  onChange={(e) => setSettings({ ...settings, retainDays: parseInt(e.target.value) })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-lg">⚠️</span>
            <div className="text-sm text-amber-800">
              <div className="font-semibold mb-1">Archive Behavior:</div>
              <ul className="space-y-1">
                <li>• Archived emails are hidden from the main view but can still be accessed</li>
                <li>• Archived emails older than 90 days are permanently deleted</li>
                <li>• This process runs automatically every night at midnight</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={saveSettings}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-50`}
          >
            {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
          </button>
          
          <div className="text-sm text-gray-500">
            Changes apply to future email processing
          </div>
        </div>
      </div>
    </div>
  );
}