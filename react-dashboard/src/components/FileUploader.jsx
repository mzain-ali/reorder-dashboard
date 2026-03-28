import React, { useState } from 'react';
import { parseFile } from '../utils/parser';

export default function FileUploader({ id, label, badge, description, type, onDataLoaded }) {
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState(''); // 'ok' | 'warn' | 'error' | ''
    const [ready, setReady] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('Reading…');
        setStatusType('');
        try {
            const data = await parseFile(file);
            const warnings = [];

            if (data._fsnMissing) {
                warnings.push('FSN column not detected — defaulted to Slow.');
            }
            if (data._duplicateCount > 0) {
                warnings.push(`${data._duplicateCount} duplicate${data._duplicateCount > 1 ? 's' : ''} merged.`);
            }
            if (data._hasOnOrder) {
                warnings.push('On Order column detected & applied.');
            }

            if (warnings.length > 0) {
                setStatus(`✓ ${data.rows.length} products loaded  ⚠ ${warnings.join('  ⚠ ')}`);
                setStatusType('warn');
            } else {
                setStatus(`✓ ${data.rows.length} products loaded`);
                setStatusType('ok');
            }

            setReady(true);
            onDataLoaded(data);
        } catch (ex) {
            setStatus('Upload failed: ' + ex);
            setStatusType('error');
            setReady(false);
            onDataLoaded(null);
        }
    };

    const isFast = type === 'fast';
    
    // Status text colors
    const statusColor = statusType === 'ok' ? 'text-emerald-600 dark:text-emerald-400' :
                        statusType === 'warn' ? 'text-amber-600 dark:text-amber-500' :
                        statusType === 'error' ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400';

    return (
        <div className={`relative bg-white border-2 border-dashed rounded-xl p-5 transition-all shadow-sm 
                        ${ready ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-600' : 'border-slate-300 hover:border-accent hover:shadow-md dark:bg-slate-800 dark:border-slate-600 dark:hover:border-accent-dark'}`} 
             id={`card-${id}`}>
            
            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3 tracking-wide uppercase 
                            ${isFast ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                {badge}
            </span>
            
            <p className="text-[15px] font-bold text-slate-900 mb-1 dark:text-slate-100">{label}</p>
            <p className="text-[13px] text-slate-500 mb-4 dark:text-slate-400">{description}</p>
            
            <label className="flex items-center justify-center gap-2 text-[13px] text-accent dark:text-accent-dark font-medium p-2.5 border border-dashed border-accent dark:border-accent-dark rounded-lg cursor-pointer transition-colors bg-accent-bg hover:bg-indigo-100 hover:border-accent-h dark:bg-accent-bg-dark dark:hover:bg-slate-700 dark:hover:border-accent-h-dark" htmlFor={`file-${id}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                Choose .xlsx or .csv file
            </label>
            
            <input
                type="file"
                id={`file-${id}`}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
            />
            
            <div className={`text-[12px] mt-3 min-h-[18px] ${statusType ? 'font-medium' : 'font-normal'} ${statusColor}`} id={`status-${id}`}>
                {status}
            </div>
        </div>
    );
}
