import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 shadow-2xl transition-all duration-300 max-h-60">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-300">Activity Log</h3>
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear Logs
          </button>
        </div>
        <div ref={logContainerRef} className="text-xs font-mono overflow-y-auto h-40 bg-black/20 p-2 rounded-md">
          {logs.length === 0 ? (
            <p className="text-slate-500">No activity yet...</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} className="flex">
                <span className="text-slate-600 mr-2">{log.timestamp}</span>
                <span className={`${getLogColor(log.type)} flex-1 whitespace-pre-wrap`}>{log.message}</span>
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogPanel;
