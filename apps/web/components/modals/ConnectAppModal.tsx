'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

interface ConnectAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ConnectAppModal({ isOpen, onClose }: ConnectAppModalProps) {
  const [appName, setAppName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      await api.post('/apps/connect', {
        app_name: appName,
        api_key: apiKey,
      });
      setAppName('');
      setApiKey('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Connection failed');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect an app</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ✕
          </button>
        </div>
        <form className="space-y-3">
          <input
            type="text"
            placeholder="App Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={handleConnect}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Connect App
          </button>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default ConnectAppModal;