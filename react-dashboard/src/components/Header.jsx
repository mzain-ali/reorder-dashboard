import React from 'react';
import { lpres, spres, dpres } from '../utils/presets';

export default function Header({ dark, setDark, onPresetLoad, currentPreset, setCurrentPreset, params, onGuideClick }) {
    const handlePrint = () => window.print();

    const presets = lpres();
    
    // Convert to array of names for select dropdown
    const presetNames = Object.keys(presets);

    const handleSavePreset = () => {
        if (!currentPreset) return alert('Enter a preset name.');
        spres(currentPreset, params);
    };

    const handleDeletePreset = () => {
        if (!currentPreset) return;
        dpres(currentPreset);
        setCurrentPreset('');
    };

    return (
        <>
            <div className="pg-hd">
                <div>
                    <h2>Advanced Reorder Agent</h2>
                    <p className="sub">Data-driven reorder logic — adaptive to historical monthly sales.</p>
                </div>
                <div className="hd-acts">
                    <button className="ibtn" id="dark-btn" onClick={() => setDark(!dark)}>
                        {dark ? '☀ Light' : '🌙 Dark'}
                    </button>
                    <button className="ibtn" id="print-btn" onClick={handlePrint}>🖨 Print</button>
                    <button className="ibtn" onClick={onGuideClick}>📖 Guide</button>
                </div>
            </div>

            <div className="fbox">
                <div className="fcol">
                    <h4>Fast Moving Logic</h4>
                    <p>Monthly sales = <code>Sales ÷ months</code><br/>
                        Trigger = below <span className="lv">{(Number(params['lt-fast']) || 0.5) + (Number(params['buf-fast']) || 0.5)} mo</span> × monthly sales<br/>
                        Order = fill to <span className="lv">{params['max-fast']} mo</span> × monthly sales → rounded to MOQ</p>
                </div>
                <div className="fcol">
                    <h4>Slow Moving Logic</h4>
                    <p>Monthly sales = <code>Sales ÷ months</code><br/>
                        Trigger = below <span className="lv">{(Number(params['lt-slow']) || 1) + (Number(params['buf-slow']) || 1)} mo</span> × monthly sales<br/>
                        Zero-sales guard = flags for manual review</p>
                </div>
            </div>

            <div className="psp">
                <span>PRESETS</span>
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
                <button className="ibtn" onClick={handleDeletePreset} style={{ color: '#991B1B' }}>🗑 Delete</button>
            </div>
        </>
    );
}
