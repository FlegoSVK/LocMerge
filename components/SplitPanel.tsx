import React, { useState } from 'react';
import { Scissors, FileJson, FileText, Loader2, Download, CheckCircle2, RefreshCw, Settings2, ArrowRight } from 'lucide-react';
import { splitFiles, readFileContent, formatFileSize } from '../utils/locEngine';
import { LogEntry, ProcessStatus, FileMap, SupportedEncoding } from '../types';

interface SplitPanelProps {
  addLog: (msg: string, type: LogEntry['type']) => void;
}

export const SplitPanel: React.FC<SplitPanelProps> = ({ addLog }) => {
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputExtension, setOutputExtension] = useState<string>('zip');
  
  // Separate Input (Reading Master) and Output (Writing files) encoding
  const [inputEncoding, setInputEncoding] = useState<SupportedEncoding>('UTF-8');
  const [outputEncoding, setOutputEncoding] = useState<SupportedEncoding>('UTF-8');

  const handleSplit = async () => {
    if (!mapFile || !masterFile) return;

    setStatus(ProcessStatus.PROCESSING);
    setProgress(0);
    setCurrentFile('');
    addLog(`Spúšťam proces: Vstup ${inputEncoding} -> Výstup ${outputEncoding}...`, 'info');

    try {
      // 1. Read Map
      addLog('Čítam map.json...', 'info');
      // Map is always UTF-8 (JSON)
      const mapContent = await readFileContent(mapFile, 'UTF-8');
      let fileMap: FileMap;
      try {
        fileMap = JSON.parse(mapContent);
      } catch (e) {
        throw new Error("Neplatný formát súboru map.json");
      }
      addLog(`Mapa načítaná. Očakávaných ${fileMap.length} súborov.`, 'success');

      // 2. Read Master & Split
      addLog(`Spracovávam hlavný súbor: ${masterFile.name}...`, 'info');
      await new Promise(r => setTimeout(r, 100)); // UI Breath
      
      const result = await splitFiles(masterFile, fileMap, inputEncoding, outputEncoding, (current, total, filename) => {
         if (current % 20 === 0 || current === total) {
           setProgress(Math.round((current / total) * 100));
           setCurrentFile(filename);
         }
      });

      let url: string;
      if (result instanceof Blob) {
        // Single JSON file output
        addLog('Generujem JSON súbor...', 'info');
        url = URL.createObjectURL(result);
        setOutputExtension('json');
      } else {
        // ZIP output
        addLog('Generujem ZIP súbor...', 'info');
        setCurrentFile('Kompresia ZIP...');
        const content = await result.generateAsync({ type: "blob" });
        url = URL.createObjectURL(content);
        setOutputExtension('zip');
      }
      
      setDownloadUrl(url);
      addLog('Spracovanie dokončené! Súbor je pripravený.', 'success');
      setStatus(ProcessStatus.COMPLETED);

    } catch (error: any) {
      console.error(error);
      addLog(`Rozdelenie zlyhalo: ${error.message}`, 'error');
      setStatus(ProcessStatus.ERROR);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scissors className="text-pink-400" />
              Fáza 2: Rozdelenie preložených súborov
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Nahrajte preložený hlavný súbor a mapu. Tu môžete tiež zmeniť kódovanie výstupných súborov (konverzia).
            </p>
          </div>
        </div>

        {/* Encoding Selector Block */}
        <div className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-3 text-pink-400">
            <Settings2 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wide">Nastavenia kódovania (Konverzia)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            
            {/* Input Encoding */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">1. Vstupné kódovanie (Master súbor)</label>
              <select 
                value={inputEncoding}
                onChange={(e) => setInputEncoding(e.target.value as SupportedEncoding)}
                className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5"
              >
                <option value="UTF-8">UTF-8 (Štandard)</option>
                <option value="windows-1250">Windows-1250</option>
                <option value="UTF-16LE">UTF-16 LE</option>
                <option value="JSON">JSON (Štruktúrovaný)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Kódovanie súboru, ktorý nahrávate.</p>
            </div>

            <div className="hidden md:flex justify-center pt-4">
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </div>

            {/* Output Encoding */}
            <div>
              <label className="text-xs font-semibold text-pink-300 block mb-1">2. Výstupné kódovanie (Do hry)</label>
              <select 
                value={outputEncoding}
                onChange={(e) => setOutputEncoding(e.target.value as SupportedEncoding)}
                className="w-full bg-slate-800 border border-pink-500/50 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5 shadow-sm shadow-pink-500/10"
              >
                <option value="UTF-8">UTF-8</option>
                <option value="windows-1250">Windows-1250</option>
                <option value="UTF-16LE">UTF-16 LE</option>
                <option value="JSON">JSON (Jeden súbor)</option>
              </select>
              <p className="text-[10px] text-pink-400/70 mt-1">Kódovanie všetkých súborov v ZIPe alebo JSON formát.</p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map Input */}
          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-300">1. Nahrať map.json</label>
             <div className={`
               border-2 border-dashed rounded-lg flex flex-col items-center text-center transition-all relative overflow-hidden
               ${mapFile 
                 ? 'border-amber-500/50 bg-amber-500/10' 
                 : 'border-slate-600 hover:border-slate-500 bg-slate-900/50 p-6'}
             `}>
               <input 
                 type="file" 
                 accept=".json"
                 onChange={(e) => {
                   if(e.target.files?.[0]) {
                     setMapFile(e.target.files[0]);
                     addLog('Súbor mapy vybraný.', 'info');
                     setDownloadUrl(null);
                     setStatus(ProcessStatus.IDLE);
                   }
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               
               {mapFile ? (
                 <div className="flex items-center w-full p-4">
                   <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400 mr-4">
                     <FileJson className="w-8 h-8" />
                   </div>
                   <div className="flex-1 text-left overflow-hidden">
                     <p className="text-sm font-bold text-amber-100 truncate">{mapFile.name}</p>
                     <p className="text-xs text-amber-400/70">{formatFileSize(mapFile.size)}</p>
                   </div>
                   <div className="p-2 text-slate-400">
                     <RefreshCw className="w-4 h-4" />
                   </div>
                 </div>
               ) : (
                 <>
                   <FileJson className="w-8 h-8 mb-2 text-slate-500" />
                   <p className="text-sm text-slate-300 truncate w-full px-2">
                     Kliknite pre výber map.json
                   </p>
                 </>
               )}
             </div>
          </div>

          {/* Master Input */}
          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-300">2. Nahrať preložený Master</label>
             <div className={`
               border-2 border-dashed rounded-lg flex flex-col items-center text-center transition-all relative overflow-hidden
               ${masterFile 
                 ? 'border-emerald-500/50 bg-emerald-500/10' 
                 : 'border-slate-600 hover:border-slate-500 bg-slate-900/50 p-6'}
             `}>
               <input 
                 type="file" 
                 accept=".txt,.json"
                 onChange={(e) => {
                   if(e.target.files?.[0]) {
                     setMasterFile(e.target.files[0]);
                     addLog('Preložený hlavný súbor vybraný.', 'info');
                     setDownloadUrl(null);
                     setStatus(ProcessStatus.IDLE);
                   }
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               
               {masterFile ? (
                 <div className="flex items-center w-full p-4">
                   <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400 mr-4">
                     <FileText className="w-8 h-8" />
                   </div>
                   <div className="flex-1 text-left overflow-hidden">
                     <p className="text-sm font-bold text-emerald-100 truncate">{masterFile.name}</p>
                     <p className="text-xs text-emerald-400/70">{formatFileSize(masterFile.size)}</p>
                   </div>
                   <div className="p-2 text-slate-400">
                     <RefreshCw className="w-4 h-4" />
                   </div>
                 </div>
               ) : (
                 <>
                   <FileText className="w-8 h-8 mb-2 text-slate-500" />
                   <p className="text-sm text-slate-300 truncate w-full px-2">
                     Kliknite pre výber MASTER súboru
                   </p>
                 </>
               )}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSplit}
            disabled={!mapFile || !masterFile || status === ProcessStatus.PROCESSING}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all min-w-[200px]
              ${(!mapFile || !masterFile) 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-500/20 active:scale-95'}
            `}
          >
            {status === ProcessStatus.PROCESSING ? (
              <div className="flex flex-col items-center leading-tight">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Rozdeľovanie {progress}%</span>
                </div>
                {currentFile && (
                  <span className="text-[10px] font-normal opacity-80 mt-1 max-w-[180px] truncate text-pink-100">
                    {currentFile}
                  </span>
                )}
              </div>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                Rozdeliť a rekonštruovať
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {status === ProcessStatus.COMPLETED && downloadUrl && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           <a 
            href={downloadUrl} 
            download={`OUTPUT_SK.${outputExtension}`}
            className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 p-6 rounded-xl flex items-center justify-between group hover:from-pink-900/60 hover:to-purple-900/60 transition-all shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/20 rounded-full text-pink-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-pink-100">Lokalizácia pripravená!</h3>
                <p className="text-pink-300/70">
                  {outputExtension === 'json' 
                    ? 'Kliknite pre stiahnutie JSON súboru.' 
                    : `Kliknite pre stiahnutie rekonštruovanej štruktúry priečinkov (${outputEncoding}).`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-medium group-hover:bg-pink-500 transition-colors">
              <Download className="w-5 h-5" />
              Stiahnuť {outputExtension.toUpperCase()}
            </div>
          </a>
        </div>
      )}
    </div>
  );
};