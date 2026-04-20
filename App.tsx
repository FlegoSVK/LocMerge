import React, { useState } from 'react';
import { Layers, GitMerge, FileCode2 } from 'lucide-react';
import { MergePanel } from './components/MergePanel';
import { SplitPanel } from './components/SplitPanel';
import { ConsoleLog } from './components/ConsoleLog';
import { LogEntry } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'merge' | 'split'>('merge');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('sk-SK', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">LocMerge</h1>
            <p className="text-slate-400 font-medium italic">Created by Flego</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex space-x-2 mb-8 bg-slate-900 p-1 rounded-lg border border-slate-800 inline-flex">
          <button
            onClick={() => setActiveTab('merge')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-all
              ${activeTab === 'merge' 
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            <GitMerge className="w-4 h-4" />
            Fáza 1: Zlúčiť
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-all
              ${activeTab === 'split' 
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            <FileCode2 className="w-4 h-4" />
            Fáza 2: Rozdeliť
          </button>
        </nav>

        {/* Main Content Area */}
        <main>
          {activeTab === 'merge' ? (
            <MergePanel addLog={addLog} />
          ) : (
            <SplitPanel addLog={addLog} />
          )}
        </main>

        {/* Logs */}
        <ConsoleLog logs={logs} />
        
        <footer className="mt-12 text-center text-slate-600 text-xs">
          <p>LocMerge v1.1 • Created by Flego • Beží lokálne vo vašom prehliadači</p>
        </footer>
      </div>
    </div>
  );
}

export default App;