import React, { useState } from 'react';
import { useDashboardState } from './hooks/useDashboardState';

import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ParametersPanel from './components/ParametersPanel';
import DashboardTabs from './components/DashboardTabs';
import BulkActionBar from './components/BulkActionBar';
import Guide from './components/Guide';

import { calcMonths } from './utils/calculator';

export default function App() {
    const {
        fastData, setFastData,
        slowData, setSlowData,
        prevFastData, setPrevFastData,
        prevSlowData, setPrevSlowData,
        params, updateParam, setParams,
        sessionState,
        setOverride, clearOverride, toggleFlag, setNote,
        results
    } = useDashboardState();

    const [dark, setDark] = useState(() => localStorage.getItem('ro_dark') === '1');
    const [currentPreset, setCurrentPreset] = useState('');
    const [showPrev, setShowPrev] = useState(false);
    
    const [view, setView] = useState('dashboard');
    const [selectedCodes, setSelectedCodes] = useState(new Set());
    
    const toggleSelection = (code) => {
        setSelectedCodes(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    };
    const clearSelection = () => setSelectedCodes(new Set());

    // Switch body dark mode class
    React.useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('ro_dark', dark ? '1' : '0');
    }, [dark]);

    const hasData = fastData || slowData;

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
            />

            <div id="err" className="err" style={{ display: 'none' }}></div>

            {/* Current Uploads */}
            <div className="up-grid">
                <FileUploader 
                    id="fast" type="fast" badge="Fast Moving"
                    label="Fast Moving Export" description="Odoo FSN report filtered to 'Fast Moving'"
                    onDataLoaded={setFastData}
                />
                <FileUploader 
                    id="slow" type="slow" badge="Slow Moving"
                    label="Slow Moving Export" description="Odoo FSN report filtered to 'Slow Moving'"
                    onDataLoaded={setSlowData}
                />
            </div>

            {/* Previous Uploads */}
            <button className="prev-toggle" onClick={() => setShowPrev(!showPrev)}>
                {showPrev ? '▼' : '▶'} Compare with Previous Period (optional)
            </button>
            
            <div className={`prev-sect ${showPrev ? 'on' : ''}`}>
                <p className="sl" style={{ marginBottom: '8px' }}>Previous Period Uploads <span style={{fontSize:'12px',fontWeight:400,color:'var(--t2)'}}>(used to calculate demand trend %)</span></p>
                <div className="up-grid">
                    <FileUploader 
                        id="pfast" type="pfast" badge="Prev Fast Moving"
                        label="Previous Fast Moving Export" description="Same FSN report from the prior period"
                        onDataLoaded={setPrevFastData}
                    />
                    <FileUploader 
                        id="pslow" type="pslow" badge="Prev Slow Moving"
                        label="Previous Slow Moving Export" description="Same FSN report from the prior period"
                        onDataLoaded={setPrevSlowData}
                    />
                </div>
            </div>

            <ParametersPanel params={params} updateParam={updateParam} calcMonths={calcMonths} />

            <div className="run-container" style={{ margin: '30px 0', display: 'flex', gap: '10px' }}>
                <button 
                    className="run" 
                    id="run-btn" 
                    disabled={!hasData}
                    onClick={() => {
                        // The useMemo hook naturally computes results, but typically users like clicking to "Update". 
                        // With React, changes happen instantly! To simulate "Run" required, we could debounce or delay rendering.
                        // But instantaneous is better. We can just use the button to optionally scroll down.
                        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    {hasData ? '↓ Jump to Results' : '⚠ Upload Data Above'}
                </button>
            </div>

            {hasData && (
                <DashboardTabs 
                    results={results} 
                    flags={sessionState.flags} toggleFlag={toggleFlag}
                    overrides={sessionState.overrides} setOverride={setOverride} clearOverride={clearOverride}
                    notes={sessionState.notes} setNote={setNote}
                    selectedCodes={selectedCodes} toggleSelection={toggleSelection}
                    defCost={Number(params['default-cost']) || 0}
                />
            )}

            <BulkActionBar 
                selectedCodes={selectedCodes} 
                clearSelection={clearSelection}
                setOverride={setOverride}
                clearOverride={clearOverride}
                toggleFlag={toggleFlag}
                setNote={setNote}
            />
        </div>
    );
}
