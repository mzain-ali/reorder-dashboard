import React, { useState } from 'react';

export default function BulkActionBar({
    selectedCodes,
    clearSelection,
    setOverride,
    clearOverride,
    toggleFlag,
    setFlag,   // Bug 2 fix: explicit flag setter
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

    // Bug 2 fix: explicit Flag All / Unflag All instead of blind toggle
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

            {/* Bug 2 fix: two explicit buttons instead of one ambiguous toggle */}
            <button onClick={handleFlagAll} title="Flag all selected items">⭐ Flag All</button>
            <button onClick={handleUnflagAll} title="Remove flag from all selected items">☆ Unflag All</button>

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
