'use client';

import { useEffect, useState } from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';

export function ConnectivityIndicator() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/sync/server-info');
        const data = await response.json();
        
        setServerUrl(data.url);
        setStatus(data.status === 'Connected' ? 'connected' : 'disconnected');
      } catch (error) {
        setStatus('disconnected');
      }
    };

    checkConnectivity();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Checking...';
    }
  };

  const Icon = status === 'connected' ? Wifi : status === 'disconnected' ? WifiOff : Server;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 ${getStatusColor()}`} />
      <span className="text-slate-600">
        <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        {serverUrl && (
          <span className="ml-1 text-slate-500">
            - <span className="font-mono text-slate-700">{serverUrl}</span>
          </span>
        )}
      </span>
    </div>
  );
}
