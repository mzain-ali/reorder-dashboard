import React from 'react';

export default function ParametersPanel({ params, updateParam, calcMonths }) {
    const months = calcMonths(params['date-start'], params['date-end']);

    const Field = ({ id, label, type = "number", min, step }) => (
        <div className="pb">
            <label className="text-xs text-slate-500 block mb-1.5 font-medium dark:text-slate-400" htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                min={min}
                step={step}
                value={params[id]}
                onChange={(e) => updateParam(id, e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-accent-dark/20 dark:focus:border-accent-dark"
            />
        </div>
    );

    return (
        <div>
            {/* Global parameters */}
            <div className="text-[13px] font-bold text-slate-900 mb-2.5 uppercase tracking-wide dark:text-slate-100">Global Settings</div>
            <div className="border-t border-slate-200 mb-4 dark:border-slate-700"></div>
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] gap-3 mb-6">
                <Field id="date-start" label="Start Date" type="date" />
                <Field id="date-end" label="End Date" type="date" />
                <Field id="default-cost" label="Default Unit Cost (if missing)" min="0" step="0.01" />
                <div className="pb">
                    <label className="text-xs text-slate-500 block mb-1.5 font-medium dark:text-slate-400">Total Sales Months</label>
                    <input type="text" value={`${months} months`} disabled className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
                </div>
            </div>

            {/* Fast Moving logic */}
            <div className="text-[13px] font-bold text-slate-900 mb-2.5 uppercase tracking-wide mt-6 dark:text-slate-100">Fast Moving Parameters</div>
            <div className="border-t border-slate-200 mb-4 dark:border-slate-700"></div>
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] gap-3 mb-6">
                <Field id="lt-fast" label="Lead Time (Months)" min="0" step="0.1" />
                <Field id="buf-fast" label="Safety Buffer (Months)" min="0" step="0.1" />
                <div className="pb">
                    <label className="text-xs text-slate-500 block mb-1.5 font-medium dark:text-slate-400">Calculated Trigger Point</label>
                    <input type="text" value={`${(Number(params['lt-fast']) || 0) + (Number(params['buf-fast']) || 0)} months`} disabled className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
                </div>
                <Field id="max-fast" label="Fill To (Max Months)" min="0" step="0.1" />
            </div>

            {/* Slow Moving logic */}
            <div className="text-[13px] font-bold text-slate-900 mb-2.5 uppercase tracking-wide mt-6 dark:text-slate-100">Slow Moving / Non-Moving Parameters</div>
            <div className="border-t border-slate-200 mb-4 dark:border-slate-700"></div>
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] gap-3 mb-6">
                <Field id="lt-slow" label="Lead Time (Months)" min="0" step="0.1" />
                <Field id="buf-slow" label="Safety Buffer (Months)" min="0" step="0.1" />
                <div className="pb">
                    <label className="text-xs text-slate-500 block mb-1.5 font-medium dark:text-slate-400">Calculated Trigger Point</label>
                    <input type="text" value={`${(Number(params['lt-slow']) || 0) + (Number(params['buf-slow']) || 0)} months`} disabled className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
                </div>
                <Field id="max-slow" label="Fill To (Max Months)" min="0" step="0.1" />
            </div>
        </div>
    );
}
