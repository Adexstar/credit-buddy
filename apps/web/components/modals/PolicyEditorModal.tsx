'use client';

// PolicyEditorModal.jsx
import { useState, type ChangeEvent } from 'react';
import { usePolicies, type Policy } from '@/hooks/usePolicies';

function PolicyEditorModal() {
  const { updatePolicy } = usePolicies();
  const [policyData, setPolicyData] = useState<Partial<Policy>>({
    app_name: '',
    rollover_percentage: 100,
    max_rollover_cap: null,
    override_expiry_days: null,
    peak_restricted: false,
    allowed_hours: { start: 0, end: 0 },
    auto_convert_on_expiry: false,
    convert_to_app_id: null,
    conversion_rate: null,
    warn_at_percentage: 20,
    notify_channels: ['email'],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setPolicyData((prev) => {
      if (name === 'app_name') {
        return { ...prev, app_name: value };
      }

      if (name === 'rollover_percentage') {
        return { ...prev, rollover_percentage: value === '' ? 0 : Number.parseFloat(value) };
      }

      if (name === 'max_rollover_cap') {
        return { ...prev, max_rollover_cap: value === '' ? null : Number.parseFloat(value) };
      }

      if (name === 'override_expiry_days') {
        return { ...prev, override_expiry_days: value === '' ? null : Number.parseInt(value, 10) };
      }

      if (name === 'peak_restricted') {
        return { ...prev, peak_restricted: checked };
      }

      if (name === 'allowed_hours[start]') {
        const currentHours = prev.allowed_hours ?? { start: 0, end: 0 };
        return { ...prev, allowed_hours: { ...currentHours, start: value === '' ? 0 : Number.parseInt(value, 10) } };
      }

      if (name === 'allowed_hours[end]') {
        const currentHours = prev.allowed_hours ?? { start: 0, end: 0 };
        return { ...prev, allowed_hours: { ...currentHours, end: value === '' ? 0 : Number.parseInt(value, 10) } };
      }

      if (name === 'auto_convert_on_expiry') {
        return { ...prev, auto_convert_on_expiry: checked };
      }

      if (name === 'convert_to_app_id') {
        return { ...prev, convert_to_app_id: value === '' ? null : value };
      }

      if (name === 'conversion_rate') {
        return { ...prev, conversion_rate: value === '' ? null : Number.parseFloat(value) };
      }

      if (name === 'warn_at_percentage') {
        return { ...prev, warn_at_percentage: value === '' ? 0 : Number.parseFloat(value) };
      }

      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }

      return prev;
    });
  };

  const handleSave = async () => {
    try {
      await updatePolicy('', policyData); // Assuming we pass app_id, for now dummy
      // Close modal and refresh policies
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Policy Editor</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">App Name</label>
            <input
              type="text"
              name="app_name"
              value={policyData.app_name || ''}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Rollover Percentage (%)</label>
            <input
              type="number"
              name="rollover_percentage"
              value={policyData.rollover_percentage}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Max Rollover Cap</label>
            <input
              type="number"
              name="max_rollover_cap"
              value={policyData.max_rollover_cap ?? ''}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Override Expiry Days</label>
            <input
              type="number"
              name="override_expiry_days"
              value={policyData.override_expiry_days ?? ''}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                name="peak_restricted"
                checked={policyData.peak_restricted}
                onChange={handleChange}
              />
              Peak Hours Restricted
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Allowed Hours (Start - End)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="allowed_hours[start]"
                value={policyData.allowed_hours?.start || 0}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-1/2"
                placeholder="Start"
              />
              <input
                type="number"
                name="allowed_hours[end]"
                value={policyData.allowed_hours?.end || 0}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-1/2"
                placeholder="End"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                name="auto_convert_on_expiry"
                checked={policyData.auto_convert_on_expiry}
                onChange={handleChange}
              />
              Auto-Convert on Expiry
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Convert To App</label>
            <input
              type="text"
              name="convert_to_app_id"
              value={policyData.convert_to_app_id ?? ''}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Conversion Rate</label>
            <input
              type="number"
              name="conversion_rate"
              value={policyData.conversion_rate ?? ''}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Warn At Percentage (%)</label>
            <input
              type="number"
              name="warn_at_percentage"
              value={policyData.warn_at_percentage}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Notification Channels</label>
            <div className="flex space-x-2">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  name="notify_channels"
                  value="email"
                  checked={policyData.notify_channels?.includes('email') ?? false}
                  onChange={e => {
                    const checked = e.target.checked;
                    setPolicyData(prev => ({
                      ...prev,
                      notify_channels: checked
                        ? [...(prev.notify_channels ?? []), 'email']
                        : (prev.notify_channels ?? []).filter(ch => ch !== 'email'),
                    }));
                  }}
                />
                Email
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  name="notify_channels"
                  value="sms"
                  checked={policyData.notify_channels?.includes('sms') ?? false}
                  onChange={e => {
                    const checked = e.target.checked;
                    setPolicyData(prev => ({
                      ...prev,
                      notify_channels: checked
                        ? [...(prev.notify_channels ?? []), 'sms']
                        : (prev.notify_channels ?? []).filter(ch => ch !== 'sms'),
                    }));
                  }}
                />
                SMS
              </label>
            </div>
          </div>
          <button
            type="submit"
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Policy
          </button>
        </form>
      </div>
    </div>
  );
}

export default PolicyEditorModal;