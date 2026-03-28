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
    const [showParams, setShowParams] = useState(false);
    const [view, setView] = useState('dashboard');
    const [selectedCodes, setSelectedCodes] = useState(new Set());

    React.useEffect(() => {
        if (currentData) setShowParams(true);
    }, [currentData]);

    const toggleSelection = (code) => {
        setSelectedCodes(prev => {
            const next = new Set(prev);
            next.has(code) ? next.delete(code) : next.add(code);
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
            <div className="px-6 py-6 pb-24 max-w-[1400px] mx-auto">
                <Guide onBack={() => setView('dashboard')} />
            </div>
        );
    }

    return (
        <div className="px-6 py-6 pb-24 max-w-[1400px] mx-auto">
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

            {/* ── STEP 1: Upload ── */}
            <div className="flex items-center gap-2.5 my-8 mt-6 overflow-hidden">
                <div className="w-9 h-9 flex items-center justify-center bg-accent-bg text-accent dark:bg-accent-bg-dark dark:text-accent-dark rounded-lg text-base shrink-0">📁</div>
                <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Step 1 — Upload Inventory Report</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-[1px]">Export your FSN Inventory Report from Odoo and drop it below (.xlsx or .csv)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <FileUploader
                    id="current" type="fast" badge="Current Period"
                    label="Current Period Export"
                    description="Odoo FSN Inventory Report — auto-detects Fast/Slow/Non class and dates"
                    onDataLoaded={setCurrentData}
                />
            </div>

            {/* Data quality warnings banner */}
            <DataWarnings warnings={dataWarnings} onDismiss={dismissWarning} />

            {/* Data summary bar */}
            {hasData && (
                <div className="flex items-center gap-2.5 bg-accent-bg border border-accent rounded-lg px-4 py-2.5 my-5 text-[13px] text-accent font-medium flex-wrap dark:bg-accent-bg-dark dark:border-accent-dark dark:text-accent-dark shadow-sm">
                    <span className="text-base leading-none">✅</span>
                    <span><strong className="font-bold">{currentData.rows.length} products</strong> loaded</span>
                    <span className="opacity-30 mx-1">|</span>
                    <span>Period: <strong className="font-bold">{params['date-start']}</strong> → <strong className="font-bold">{params['date-end']}</strong></span>
                    <span className="opacity-30 mx-1">|</span>
                    <span><strong className="font-bold">{months}</strong> months of sales data</span>
                    {currentData._hasOnOrder && (
                        <><span className="opacity-30 mx-1">|</span><span>📦 On Order netting active</span></>
                    )}
                </div>
            )}

            {/* Previous period */}
            <button className="flex items-center gap-1.5 text-[13px] text-accent font-medium cursor-pointer bg-transparent border border-dashed border-accent rounded-lg px-3.5 py-2 mt-4 transition-colors hover:bg-accent-bg dark:text-accent-dark dark:border-accent-dark dark:hover:bg-accent-bg-dark" onClick={() => setShowPrev(!showPrev)}>
                {showPrev ? '▾' : '▸'} Compare with Previous Period <span className="text-xs font-normal ml-1 opacity-70">(optional — enables trend detection)</span>
            </button>

            {showPrev && (
                <div className="mt-3">
                    <div className="grid grid-cols-1 gap-3">
                        <FileUploader
                            id="prev" type="slow" badge="Previous Period"
                            label="Previous Period Export"
                            description="Same FSN report from the prior period — used to calculate demand trend %"
                            onDataLoaded={setPrevData}
                        />
                    </div>
                </div>
            )}

            {/* ── STEP 2: Configure Parameters ── */}
            <button
                className="w-full flex items-center justify-between text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-4 py-3 cursor-pointer transition-colors mt-6 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm"
                onClick={() => setShowParams(p => !p)}
            >
                <span>⚙ Step 2 — Configure Parameters {!hasData && <span className="text-xs font-normal opacity-60 ml-1">(upload data first)</span>}</span>
                <span className={`text-xs text-slate-500 transition-transform duration-200 ${showParams ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showParams && (
                <div className="pt-4">
                    <ParametersPanel params={params} updateParam={updateParam} calcMonths={calcMonths} />
                </div>
            )}

            {/* ── Jump to results ── */}
            <div className="my-6">
                <button
                    className="w-full p-3.5 text-[15px] font-bold cursor-pointer rounded-lg bg-accent text-white transition-all shadow-[0_2px_8px_rgba(79,70,229,0.35)] hover:bg-accent-h hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(79,70,229,0.45)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:bg-accent-dark dark:hover:bg-accent-h-dark dark:shadow-[0_2px_8px_rgba(99,102,241,0.25)] dark:hover:shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                    id="run-btn"
                    disabled={!hasData}
                    onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    {hasData ? `↓ View ${results.length} Reorder Recommendations` : '⚠ Upload a Report Above to Get Started'}
                </button>
            </div>

            {/* ── STEP 3: Results ── */}
            {hasData && (
                <>
                    <div className="flex items-center gap-2.5 my-8 mt-10 mb-4 overflow-hidden">
                        <div className="w-9 h-9 flex items-center justify-center bg-accent-bg text-accent dark:bg-accent-bg-dark dark:text-accent-dark rounded-lg text-base shrink-0">📋</div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Step 3 — Reorder Recommendations</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-[1px]">Items ranked by urgency based on {months} months of actual sales data</p>
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
