import React, { useState } from 'react';
import { useDashboardState } from './hooks/useDashboardState';

import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ParametersPanel from './components/ParametersPanel';
import DashboardTabs from './components/DashboardTabs';
import BulkActionBar from './components/BulkActionBar';
import DataWarnings from './components/DataWarnings';
import Guide from './components/Guide';

import { calcMonths } from './utils/calculator';

export default function App() {
    const {
        currentData, setCurrentData,
        prevData, setPrevData,
        params, updateParam, setParams,
        sessionState,
        setOverride, clearOverride, toggleFlag, setFlag, setNote,
        results,
        dataWarnings, dismissWarning,
        presets, savePreset, deletePreset,
    } = useDashboardState();

    const [dark, setDark] = useState(() => localStorage.getItem('ro_dark') === '1');
    const [currentPreset, setCurrentPreset] = useState('');
    const [showPrev, setShowPrev] = useState(false);
    // Progressive disclosure: params collapsed by default, auto-opens when data loads
    const [showParams, setShowParams] = useState(false);

    const [view, setView] = useState('dashboard');
    const [selectedCodes, setSelectedCodes] = useState(new Set());

    // Auto-expand params once data is loaded
    React.useEffect(() => {
        if (currentData) setShowParams(true);
    }, [!!currentData]);

    const toggleSelection = (code) => {
        setSelectedCodes(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    };
    const clearSelection = () => setSelectedCodes(new Set());

    React.useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('ro_dark', dark ? '1' : '0');
    }, [dark]);

    const hasData = !!currentData;
    const months = calcMonths(params['date-start'], params['date-end']);

    if (view === 'guide') {
        return (
            <div className="wrap">
                <Guide onBack={() => setView('dashboard')} />
            </div>
        );
    }

    return (
        <div className="wrap">
            <Header
                dark={dark} setDark={setDark}
                params={params}
                currentPreset={currentPreset} setCurrentPreset={setCurrentPreset}
                onPresetLoad={loadedParams => setParams(loadedParams)}
                onGuideClick={() => setView('guide')}
                presets={presets}
                savePreset={savePreset}
                deletePreset={deletePreset}
            />

            {/* ── STEP 1: Upload ───────────────────────────────────────── */}
            <div className="section-header">
                <div className="sh-icon">📁</div>
                <div className="sh-text">
                    <h3>Step 1 — Upload Inventory Report</h3>
                    <p>Export your FSN Inventory Report from Odoo and drop it below (.xlsx or .csv)</p>
                </div>
            </div>

            <div className="up-grid">
                <FileUploader
                    id="current" type="fast" badge="Current Period"
                    label="Current Period Export"
                    description="Odoo FSN Inventory Report — auto-detects Fast/Slow/Non class and dates"
                    onDataLoaded={setCurrentData}
                />
            </div>

            {/* Data quality warnings banner */}
            <DataWarnings warnings={dataWarnings} onDismiss={dismissWarning} />

            {/* Data summary bar — shown after upload instead of formula box */}
            {hasData && (
                <div className="data-summary">
                    <span className="ds-icon">✅</span>
                    <strong>{currentData.rows.length} products</strong> loaded
                    <span className="ds-sep">|</span>
                    <span>Period: <strong>{params['date-start']}</strong> → <strong>{params['date-end']}</strong></span>
                    <span className="ds-sep">|</span>
                    <span><strong>{months}</strong> months of sales data</span>
                    {currentData._hasOnOrder && (
                        <><span className="ds-sep">|</span><span>📦 On Order netting active</span></>
                    )}
                </div>
            )}

            {/* Previous period (collapsible) */}
            <button className="prev-toggle" onClick={() => setShowPrev(!showPrev)}>
                {showPrev ? '▾' : '▸'} Compare with Previous Period <span style={{fontSize:'12px', fontWeight:400, marginLeft:'4px'}}>(optional — enables trend detection)</span>
            </button>

            <div className={`prev-sect ${showPrev ? 'on' : ''}`}>
                <div className="up-grid" style={{ marginTop: '10px' }}>
                    <FileUploader
                        id="prev" type="slow" badge="Previous Period"
                        label="Previous Period Export"
                        description="Same FSN report from the prior period — used to calculate demand trend %"
                        onDataLoaded={setPrevData}
                    />
                </div>
            </div>

            {/* ── STEP 2: Configure Parameters ────────────────────────── */}
            <button
                className={`params-toggle ${showParams ? 'open' : ''}`}
                onClick={() => setShowParams(p => !p)}
            >
                <span>⚙ Step 2 — Configure Parameters {!hasData && <span style={{fontSize:'12px',fontWeight:400,opacity:.6}}>(upload data first)</span>}</span>
                <span className="pt-chevron">▼</span>
            </button>

            <div className={`params-body ${showParams ? 'on' : ''}`}>
                <ParametersPanel params={params} updateParam={updateParam} calcMonths={calcMonths} />
            </div>

            {/* ── Jump to results ──────────────────────────────────────── */}
            <div style={{ margin: '1.5rem 0' }}>
                <button
                    className="run"
                    id="run-btn"
                    disabled={!hasData}
                    onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    {hasData ? `↓ View ${results.length} Reorder Recommendations` : '⚠ Upload a Report Above to Get Started'}
                </button>
            </div>

            {/* ── STEP 3: Results ──────────────────────────────────────── */}
            {hasData && (
                <>
                    <div className="section-header">
                        <div className="sh-icon">📋</div>
                        <div className="sh-text">
                            <h3>Step 3 — Reorder Recommendations</h3>
                            <p>Items ranked by urgency based on {months} months of actual sales data</p>
                        </div>
                    </div>

                    <DashboardTabs
                        results={results}
                        flags={sessionState.flags} toggleFlag={toggleFlag}
                        overrides={sessionState.overrides} setOverride={setOverride} clearOverride={clearOverride}
                        notes={sessionState.notes} setNote={setNote}
                        selectedCodes={selectedCodes} toggleSelection={toggleSelection}
                        defCost={Number(params['default-cost']) || 0}
                    />
                </>
            )}

            {/* Fixed bottom bulk action bar */}
            <BulkActionBar
                selectedCodes={selectedCodes}
                clearSelection={clearSelection}
                setOverride={setOverride}
                clearOverride={clearOverride}
                toggleFlag={toggleFlag}
                setFlag={setFlag}
                setNote={setNote}
            />
        </div>
    );
}
