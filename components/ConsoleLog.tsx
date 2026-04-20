import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-6 bg-black/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700 uppercase tracking-wider flex justify-between items-center">
        <span>Systémový záznam</span>
        <span>{logs.length} udalostí</span>
      </div>
      <div 
        ref={scrollRef}
        className="h-48 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};