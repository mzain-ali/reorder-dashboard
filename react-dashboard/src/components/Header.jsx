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
            <div className="pg-hd">
                <div>
                    <h2>🔄 Adaptive Reorder Agent</h2>
                    <p className="sub">Inventory restocking decisions driven by actual sales history — not static rules.</p>
                </div>
                <div className="hd-acts">
                    <button className="ibtn" onClick={onGuideClick}>📖 Guide</button>
                    <button className="ibtn" id="print-btn" onClick={handlePrint}>🖨 Print</button>
                    <button className="ibtn" id="dark-btn" onClick={() => setDark(!dark)}>
                        {dark ? '☀ Light' : '🌙 Dark'}
                    </button>
                </div>
            </div>

            {/* Preset bar */}
            <div className="psp">
                <span>Presets</span>
                <input
                    type="text"
                    placeholder="Preset name…"
                    value={currentPreset}
                    onChange={e => setCurrentPreset(e.target.value)}
                />
                <button className="ibtn" onClick={handleSavePreset}>💾 Save</button>
                <select value={presetNames.includes(currentPreset) ? currentPreset : ''} onChange={e => {
                    const n = e.target.value;
                    if (!n) return;
                    setCurrentPreset(n);
                    onPresetLoad(presets[n]);
                }}>
                    <option value="">— Load preset —</option>
                    {presetNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button className="ibtn" onClick={handleDeletePreset} style={{ color: '#DC2626' }}>🗑 Delete</button>
            </div>
        </>
    );
}
