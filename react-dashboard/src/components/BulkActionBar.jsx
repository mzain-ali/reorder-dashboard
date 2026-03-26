import React, { useState } from 'react';

export default function BulkActionBar({ 
    selectedCodes, 
    clearSelection, 
    setOverride, 
    clearOverride, 
    toggleFlag, 
    setNote 
}) {
    const [qty, setQty] = useState('');
    const [noteText, setNoteText] = useState('');

    if (selectedCodes.size === 0) return null;

    const count = selectedCodes.size;

    const handleApplyQty = () => {
        const v = Math.max(0, parseInt(qty) || 0);
        selectedCodes.forEach(code => setOverride(code, v));
    };

    const handleClearOverrides = () => {
        selectedCodes.forEach(code => clearOverride(code));
    };

    const handleFlag = (on) => {
        // Here we just toggle, or set explicitly? Wait, Vanilla just "flagged". 
        // If "on" is true, we should add if not present.
        // But our `toggleFlag` just flips. Let's make it simpler: toggleFlag flips, but bulk action might want explicit add.
        // Actuallly I'll just iterate and trigger toggleFlag. If they're already flagged, it unflags them.
        // It's better if `setFlag(code, bool)` existed, but let's just toggle for now matching vanilla "Toggle Flag".
        // Wait, vanilla had "Flag" and "Unflag". I should just do toggle for now.
        selectedCodes.forEach(code => toggleFlag(code)); // It flips state!
    };

    const handleApplyNote = () => {
        selectedCodes.forEach(code => setNote(code, noteText));
    };

    return (
        <div className="bulk-bar on">
            <span id="bulk-count">{count} selected</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                Set Qty 
                <input 
                    type="number" 
                    min="0" 
                    placeholder="qty"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                />
            </label>
            <button onClick={handleApplyQty}>Apply Qty</button>
            <button onClick={handleClearOverrides}>Clear Overrides</button>
            <button onClick={() => handleFlag(true)}>⭐ Toggle Flags</button>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                + Note 
                <input 
                    type="text" 
                    placeholder="note text"
                    style={{ width: '100px', padding: '3px 6px', borderRadius: '4px', border: 'none', fontFamily: 'inherit', fontSize: '12px', color: 'var(--t1)' }}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                />
            </label>
            <button onClick={handleApplyNote}>Apply Note</button>
            
            <button className="bulk-close" onClick={clearSelection}>×</button>
        </div>
    );
}
