import React, { useState } from 'react';

export default function BulkActionBar({
    selectedCodes,
    clearSelection,
    setOverride,
    clearOverride,
    toggleFlag,
    setFlag,
    setNote
}) {
    const [qty, setQty] = useState('');
    const [noteText, setNoteText] = useState('');

    if (selectedCodes.size === 0) return null;

    const handleApplyQty = () => {
        const v = Math.max(0, parseInt(qty) || 0);
        selectedCodes.forEach(code => setOverride(code, v));
    };

    const handleClearOverrides = () => {
        selectedCodes.forEach(code => clearOverride(code));
    };

    const handleFlagAll = () => {
        selectedCodes.forEach(code => setFlag(code, true));
    };
    const handleUnflagAll = () => {
        selectedCodes.forEach(code => setFlag(code, false));
    };

    const handleApplyNote = () => {
        selectedCodes.forEach(code => setNote(code, noteText));
    };

    return (
        <div className="bulk-bar visible">
            <span className="font-bold">{selectedCodes.size} selected</span>

            <div className="w-[1px] h-5 bg-slate-600 mx-1 hidden sm:block"></div>

            <label className="flex items-center gap-1.5 text-xs">
                Set Qty
                <input
                    type="number"
                    min="0"
                    placeholder="qty"
                    className="w-16 px-2 py-1.5 text-xs rounded-md border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-accent-dark"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                />
            </label>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-white/20 bg-white/10 text-white cursor-pointer transition-colors hover:bg-white/20 whitespace-nowrap" onClick={handleApplyQty}>Apply</button>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-white/20 bg-white/10 text-white cursor-pointer transition-colors hover:bg-white/20 whitespace-nowrap" onClick={handleClearOverrides}>Clear Overrides</button>

            <div className="w-[1px] h-5 bg-slate-600 mx-1 hidden md:block"></div>

            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-amber-500/50 bg-amber-500/20 text-amber-200 cursor-pointer transition-colors hover:bg-amber-500/30 whitespace-nowrap" onClick={handleFlagAll} title="Flag all selected items">⭐ Flag</button>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-500 bg-slate-700/50 text-slate-300 cursor-pointer transition-colors hover:bg-slate-700 whitespace-nowrap" onClick={handleUnflagAll} title="Remove flag from all selected items">☆ Unflag</button>

            <div className="w-[1px] h-5 bg-slate-600 mx-1 hidden lg:block"></div>

            <label className="flex items-center gap-1 text-xs">
                + Note
                <input
                    type="text"
                    placeholder="Enter note..."
                    className="w-24 lg:w-32 px-2 py-1.5 text-xs rounded-md border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-accent-dark ml-1"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                />
            </label>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-white/20 bg-white/10 text-white cursor-pointer transition-colors hover:bg-white/20 whitespace-nowrap" onClick={handleApplyNote}>Apply Note</button>

            <button className="ml-auto bg-transparent border-none text-[20px] cursor-pointer text-white/50 px-1 py-0 leading-none hover:text-white transition-colors" onClick={clearSelection}>×</button>
        </div>
    );
}
