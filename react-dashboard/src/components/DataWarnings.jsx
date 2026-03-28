import React from 'react';

export default function DataWarnings({ warnings, onDismiss }) {
    if (!warnings || warnings.length === 0) return null;

    return (
        <div className="my-3 flex flex-col gap-1.5">
            {warnings.map((msg, i) => (
                <div className="flex items-start md:items-center gap-2.5 bg-amber-50 border border-amber-400 border-l-4 border-l-amber-500 rounded-lg px-4 py-3 text-[13px] text-amber-900 shadow-sm dark:bg-[#2D1D00] dark:border-amber-700/50 dark:border-l-amber-600 dark:text-amber-200" key={i}>
                    <span className="text-[16px] shrink-0 mt-0.5 md:mt-0">⚠</span>
                    <span className="flex-1 leading-snug font-medium">{msg}</span>
                    <button 
                        className="bg-transparent border-none cursor-pointer text-[14px] text-amber-900/40 px-1 py-1 shrink-0 hover:text-amber-900 hover:bg-amber-900/10 rounded transition-colors dark:text-amber-200/50 dark:hover:text-amber-200 dark:hover:bg-amber-200/10" 
                        onClick={() => onDismiss(i)} 
                        title="Dismiss"
                        aria-label="Dismiss warning"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
