
import React from 'react';
import { SprinklerData } from '../types';

interface DataTableProps {
  data: SprinklerData[];
  onClear: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onClear }) => {
  const headers: (keyof SprinklerData)[] = [
    'property', 'reportDate', 'category', 'sectionLabel', 'deviceType', 
    'location', 'issueDescription', 'quantity', 'actionRequired', 
    'resultMark', 'inspectorNotes', 'photoLinks', 'sourceFile'
  ];

  const generateTSV = () => {
    const headerRow = headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1')).join('\t');
    const rows = data.map(item => 
      headers.map(header => (item[header] || '').toString().replace(/\t/g, ' ')).join('\t')
    );
    return [headerRow, ...rows].join('\n');
  };

  const copyToClipboard = () => {
    const tsv = generateTSV();
    navigator.clipboard.writeText(tsv);
    alert('TSV copied! Paste into Excel.');
  };

  if (data.length === 0) return null;

  return (
    <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/50 backdrop-blur-md gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">NICET III Extraction Results</h3>
          <p className="text-sm text-slate-400">{data.length} items mapped from reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-900/20 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy TSV for Excel
          </button>
          <button
            onClick={onClear}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-sm font-bold"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
              {headers.map(h => (
                <th key={h} className="px-6 py-4 border-b border-slate-800">
                  {h.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-indigo-500/5 transition-colors text-sm text-slate-300 group">
                {headers.map(h => (
                  <td key={h} className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                    {h === 'sectionLabel' ? (
                      <span className="font-bold text-indigo-400">
                        {item[h]}
                      </span>
                    ) : h === 'resultMark' ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-black uppercase">
                        {item[h]}
                      </span>
                    ) : (
                      item[h] || <span className="text-slate-700">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
