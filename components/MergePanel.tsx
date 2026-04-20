import React, { useState, useRef, useMemo } from 'react';
import { FileUp, FileJson, FileType, Loader2, Download, AlertCircle, RefreshCw, FileText, Settings2 } from 'lucide-react';
import { mergeFiles, formatFileSize } from '../utils/locEngine';
import { LogEntry, ProcessStatus, SupportedEncoding } from '../types';

interface MergePanelProps {
  addLog: (msg: string, type: LogEntry['type']) => void;
}

export const MergePanel: React.FC<MergePanelProps> = ({ addLog }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [downloadUrls, setDownloadUrls] = useState<{ master: string; map: string } | null>(null);
  const [encoding, setEncoding] = useState<SupportedEncoding>('UTF-8');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + file.size, 0);
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setStatus(ProcessStatus.IDLE);
      setDownloadUrls(null);
      addLog(`Vybraných ${e.target.files.length} súborov na zlúčenie.`, 'info');
    }
  };

  const handleMerge = async () => {
    if (files.length === 0) return;

    setStatus(ProcessStatus.PROCESSING);
    addLog(`Spúšťam proces zlučovania s kódovaním ${encoding}...`, 'info');
    setProgress(0);
    setCurrentFile('');

    try {
      await new Promise(r => setTimeout(r, 100));

      const { masterBlob, fileMap } = await mergeFiles(files, encoding, (current, total, filename) => {
        // Update progress every 20 files or on the last one to prevent UI blocking on large sets
        if (current % 20 === 0 || current === total) {
          setProgress(Math.round((current / total) * 100));
          setCurrentFile(filename);
        }
      });

      const mapBlob = new Blob([JSON.stringify(fileMap, null, 2)], { type: 'application/json' });

      const masterUrl = URL.createObjectURL(masterBlob);
      const mapUrl = URL.createObjectURL(mapBlob);

      setDownloadUrls({ master: masterUrl, map: mapUrl });
      addLog(`Úspešne zlúčených ${files.length} súborov.`, 'success');
      addLog(`Vygenerovaný mapovací súbor s ${fileMap.length} záznamami.`, 'success');
      setStatus(ProcessStatus.COMPLETED);

    } catch (error: any) {
      console.error(error);
      addLog(`Zlúčenie zlyhalo: ${error.message}`, 'error');
      setStatus(ProcessStatus.ERROR);
    }
  };

  const getMasterFileName = () => {
    return encoding === 'JSON' ? 'MASTER_EN.json' : 'MASTER_EN.txt';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileUp className="text-indigo-400" />
              Fáza 1: Zlúčenie zdrojových súborov
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Vyberte všetky vaše súbory (txt, json). Skombinujeme ich do jedného hlavného súboru (Master).
            </p>
          </div>
          <div className="text-right">
             <span className="text-3xl font-bold text-slate-200">{files.length}</span>
             <span className="text-xs text-slate-500 block uppercase tracking-wider">Vybraných súborov</span>
          </div>
        </div>

        {/* Encoding Selector */}
        <div className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Settings2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-300 block mb-1">Kódovanie súboru Master a výstupu</label>
            <p className="text-xs text-slate-500">Vyberte kódovanie pre výstupný Master súbor. Vstupné súbory by mali byť v rovnakom formáte.</p>
          </div>
          <select 
            value={encoding}
            onChange={(e) => setEncoding(e.target.value as SupportedEncoding)}
            className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 min-w-[150px]"
          >
            <option value="UTF-8">UTF-8</option>
            <option value="windows-1250">Windows-1250</option>
            <option value="UTF-16LE">UTF-16 LE s BOM</option>
            <option value="JSON">JSON (Štruktúrovaný)</option>
          </select>
        </div>

        {/* File Selection Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${files.length > 0 
              ? 'border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10' 
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 p-10'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple 
            accept=".txt,.json" 
            className="hidden" 
          />
          
          {files.length === 0 ? (
            <div className="flex flex-col items-center gap-3">
               <FileType className="w-12 h-12 text-slate-500" />
               <div className="text-slate-400">
                 <p className="font-medium">Kliknite pre výber zdrojových súborov</p>
                 <p className="text-xs mt-1">Podporované: .txt, .json</p>
               </div>
            </div>
          ) : (
            <div className="w-full text-left">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-200">
                  <FileType className="w-5 h-5" />
                  <span className="font-semibold">{files.length} súborov pripravených</span>
                </div>
                <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                  Celkom: {formatFileSize(totalSize)}
                </span>
              </div>
              
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
                {files.slice(0, 50).map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-sm text-slate-300 border border-slate-700/50">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{formatFileSize(file.size)}</span>
                  </div>
                ))}
                {files.length > 50 && (
                  <div className="text-center text-xs text-slate-500 py-2 italic">
                    ...a {files.length - 50} ďalších súborov
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                 <span className="text-xs text-indigo-300 flex items-center gap-1 hover:text-white transition-colors">
                   <RefreshCw className="w-3 h-3" />
                   Kliknite pre zmenu výberu
                 </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleMerge}
            disabled={files.length === 0 || status === ProcessStatus.PROCESSING}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all min-w-[200px]
              ${files.length === 0 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95'}
            `}
          >
            {status === ProcessStatus.PROCESSING ? (
              <div className="flex flex-col items-center leading-tight">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Spracováva sa {progress}%</span>
                </div>
                {currentFile && (
                  <span className="text-[10px] font-normal opacity-80 mt-1 max-w-[180px] truncate text-indigo-100">
                    {currentFile}
                  </span>
                )}
              </div>
            ) : (
              <>
                <FileUp className="w-5 h-5" />
                Zlúčiť súbory
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {status === ProcessStatus.COMPLETED && downloadUrls && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <a 
            href={downloadUrls.master} 
            download={getMasterFileName()}
            className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between group hover:bg-emerald-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <FileType className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-emerald-100">{getMasterFileName()}</p>
                <p className="text-xs text-emerald-400/70">
                   {encoding === 'JSON' ? 'Štruktúrovaný JSON formát' : `Kombinovaný zdrojový text (${encoding})`}
                </p>
              </div>
            </div>
            <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </a>

          <a 
            href={downloadUrls.map} 
            download="map.json"
            className="bg-amber-900/30 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between group hover:bg-amber-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-amber-100">map.json</p>
                <p className="text-xs text-amber-400/70">Potrebné pre rekonštrukciu</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          
          <div className="col-span-1 md:col-span-2 mt-2 bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-blue-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-400" />
            <p>
              <strong>Dôležité:</strong> Uchovajte <code>map.json</code> v bezpečí! Absolútne ho potrebujete pre Fázu 2.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};