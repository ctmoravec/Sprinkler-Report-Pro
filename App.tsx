
import React, { useState, useRef } from 'react';
import { parseSprinklerReport, queryEstimator } from './services/geminiService';
import { SprinklerData, ProcessingState, ChatMessage } from './types';
import DataTable from './components/DataTable';

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<SprinklerData[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const processFiles = async (files: FileList) => {
    setStatus({ isProcessing: true, progress: 0, error: null });
    const allParsed: SprinklerData[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const base64 = await fileToBase64(file);
        const results = await parseSprinklerReport(base64, file.type, file.name);
        allParsed.push(...results);
        setStatus(prev => ({ ...prev, progress: Math.round(((i + 1) / fileArray.length) * 100) }));
      } catch (err: any) {
        setStatus(prev => ({ ...prev, error: `Critical Failure on ${file.name}: ${err.message}` }));
      }
    }

    setExtractedData(prev => [...prev, ...allParsed]);
    setStatus(prev => ({ ...prev, isProcessing: false, progress: 100 }));
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || status.isProcessing) return;

    const currentInput = userInput;
    setUserInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    
    setStatus(prev => ({ ...prev, isProcessing: true }));
    
    const formattedHistory = chatHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    const response = await queryEstimator(currentInput, formattedHistory);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setStatus(prev => ({ ...prev, isProcessing: false }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.4503-.385c-.39.23-.75.485-1.071.763C7.062 5.07 5 8.277 5 11v4.872c0 .21.054.419.156.602l.197.353c.334.6.359 1.311.064 1.934l-.059.124a.5.5 0 00.541.66l.12-.006a3.5 3.5 0 012.954 1.103 1 1 0 001.4503-.385c.39-.23.75-.485 1.071-.763C12.938 16.93 15 13.723 15 11v-4.872c0-.21-.054-.419-.156-.602l-.197-.353a2.466 2.466 0 01-.064-1.934l.059-.124a.5.5 0 00-.541-.66l-.12.006a3.5 3.5 0 01-2.954-1.103z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">SprinklerReport <span className="text-indigo-500">PRO</span></h1>
          <p className="text-slate-400 font-medium tracking-wide">NICET III FIRE SPRINKLER ESTIMATOR CO-PILOT</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input & Dropzone */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className={`relative h-80 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-8 group ${
                dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,.pdf" onChange={e => e.target.files && processFiles(e.target.files)} />
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-1">Extraction Mode</h3>
              <p className="text-slate-400 text-sm mb-6">Drop inspection PDFs or images here to identify negative items.</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                Browse Reports
              </button>

              {status.isProcessing && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-12 z-20">
                  <div className="w-full max-w-sm bg-slate-900 h-1.5 rounded-full mb-4 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${status.progress}%` }} />
                  </div>
                  <p className="text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">NICET ESTIMATOR PROCESSING... {status.progress}%</p>
                </div>
              )}
            </div>

            {status.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span className="text-sm font-bold uppercase tracking-wider">{status.error}</span>
              </div>
            )}

            <DataTable data={extractedData} onClear={() => { setExtractedData([]); setStatus({ isProcessing: false, progress: 0, error: null }); }} />
          </div>

          {/* Right Column: Assistant Mode (Chat) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-[700px] overflow-hidden shadow-xl sticky top-8">
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Assistant Mode</h3>
              <p className="text-xs text-slate-500">Consult with the NICET III Estimator</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {chatHistory.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-600 text-sm italic">"Ask about extraction results or paste a scope of work to generate an estimate."</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                  }`}>
                    {msg.text.split('\n').map((line, j) => <p key={j} className="mb-1">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleChat} className="p-4 bg-slate-950/50 border-t border-slate-800">
              <div className="relative">
                <input 
                  type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                  placeholder="Ask a question or provide scope..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-12 text-slate-200"
                />
                <button type="submit" disabled={!userInput.trim() || status.isProcessing} className="absolute right-2 top-2 p-1.5 text-indigo-500 hover:text-indigo-400 disabled:opacity-30 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Legend */}
        <footer className="mt-16 text-center text-slate-600 text-xs font-black uppercase tracking-[0.3em]">
          SprinklerReport Pro — NICET III Logic Engine V5.2 — Strictly Confidential
        </footer>
      </div>
    </div>
  );
};

export default App;
