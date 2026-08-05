'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { PROVIDERS, type CreditBucket } from '@/types';

interface ConversionModalProps {
  bucket: Pick<CreditBucket, 'id' | 'app_name' | 'remaining_balance'> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export function ConversionModal({ bucket, isOpen, onClose, onSuccess }: ConversionModalProps) {
  const [targetApp, setTargetApp] = useState('');
  const [conversionRate, setConversionRate] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !bucket) return null;

  const handleConvert = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/credits/convert', {
        source_bucket_id: bucket.id,
        target_app_id: targetApp,
        conversion_rate: conversionRate,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const netAmount = (bucket.remaining_balance * conversionRate * 0.9).toFixed(2);
  const fee = (bucket.remaining_balance * 0.1).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Convert Credits</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Source</p>
          <p className="font-semibold text-gray-900 dark:text-white">{bucket.app_name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{bucket.remaining_balance.toFixed(2)} credits</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Target App
          </label>
          <select
            value={targetApp}
            onChange={(e) => setTargetApp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select target app...</option>
            {PROVIDERS.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Conversion Rate
          </label>
          <input
            type="number"
            step="0.01"
            value={conversionRate}
            onChange={(e) => setConversionRate(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Gross converted</span>
            <span className="text-gray-900 dark:text-white">{(bucket.remaining_balance * conversionRate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Platform fee (10%)</span>
            <span className="text-red-600 dark:text-red-400">-{fee}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-200 dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">Net received</span>
            <span className="text-green-600 dark:text-green-400">{netAmount}</span>
          </div>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={loading || !targetApp}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </div>
      </div>
    </div>
  );
}