import React from 'react';

export default function Header({ dark, setDark, onPresetLoad, currentPreset, setCurrentPreset, params, onGuideClick, presets, savePreset, deletePreset }) {
    const handlePrint = () => window.print();
    const presetNames = Object.keys(presets);

    const handleSavePreset = () => {
        if (!currentPreset) return alert('Enter a preset name.');
        savePreset(currentPreset, params);
    };

    const handleDeletePreset = () => {
        if (!currentPreset) return;
        deletePreset(currentPreset);
        setCurrentPreset('');
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-200 gap-4 dark:border-slate-700">
                <div>
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight dark:text-slate-100">🔄 Adaptive Reorder Agent</h2>
                    <p className="text-[13px] text-slate-500 mt-0.5 dark:text-slate-400">Inventory restocking decisions driven by actual sales history — not static rules.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" onClick={onGuideClick}>📖 Guide</button>
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" id="print-btn" onClick={handlePrint}>🖨 Print</button>
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" id="dark-btn" onClick={() => setDark(!dark)}>
                        {dark ? '☀ Light' : '🌙 Dark'}
                    </button>
                </div>
            </div>

            {/* Preset bar */}
            <div className="flex gap-2 items-center flex-wrap bg-slate-100 p-2.5 px-3.5 rounded-lg border border-slate-200 mb-5 dark:bg-slate-800/50 dark:border-slate-700">
                <span className="text-slate-500 text-[11px] font-bold tracking-wide uppercase mr-1 dark:text-slate-400">Presets</span>
                <input
                    type="text"
                    placeholder="Preset name…"
                    className="text-[13px] px-2.5 py-1.5 rounded-md border border-slate-300 w-[155px] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-accent-dark/30 dark:focus:border-accent-dark"
                    value={currentPreset}
                    onChange={e => setCurrentPreset(e.target.value)}
                />
                <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" onClick={handleSavePreset}>💾 Save</button>
                <select 
                    className="text-[13px] px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-accent-dark/30 dark:focus:border-accent-dark"
                    value={presetNames.includes(currentPreset) ? currentPreset : ''} 
                    onChange={e => {
                        const n = e.target.value;
                        if (!n) return;
                        setCurrentPreset(n);
                        onPresetLoad(presets[n]);
                    }}
                >
                    <option value="">— Load preset —</option>
                    {presetNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 cursor-pointer transition-all whitespace-nowrap hover:bg-red-100 hover:text-red-800 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50" onClick={handleDeletePreset}>🗑 Delete</button>
            </div>
        </>
    );
}
