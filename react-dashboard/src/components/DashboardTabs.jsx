import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import TimelineView from './TimelineView';
import PODraft from './PODraft';
import FilterBar from './FilterBar';

export default function DashboardTabs({
    results, flags, toggleFlag, overrides, setOverride, clearOverride, notes, setNote,
    selectedCodes, toggleSelection, defCost
}) {
    const [tab, setTab] = useState('tbl');
    const [filters, setFilters] = useState({});

    const toggleFilter = (key, val) => {
        setFilters(prev => {
            const next = new Set(prev[key] || []);
            next.has(val) ? next.delete(val) : next.add(val);
            return { ...prev, [key]: next };
        });
    };

    const filteredResults = useMemo(() => {
        return results.filter(r => {
            if (filters.priority?.size > 0 && !filters.priority.has(r.priority)) return false;
            if (filters.class?.size > 0) {
                const c = r.xyz ? r.xyz.slice(-1) : '';
                if (!filters.class.has(c)) return false;
            }
            if (filters.custom?.has('starred') && !flags.has(r.code)) return false;
            return true;
        });
    }, [results, filters, flags]);

    if (!results || results.length === 0) return null;

    const needsAction = results.filter(r => r.priority !== 'ok').length;
    const totalOrderValue = results.reduce((s, r) => {
        const qty = overrides[r.code] !== undefined ? overrides[r.code] : r.oq;
        return s + (qty > 0 && r.cost > 0 ? qty * r.cost : 0);
    }, 0);

    return (
        <div id="results">
            {/* Results summary strip */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'var(--bg1)',
                border: '1px solid var(--bd2)',
                borderRadius: 'var(--r2) var(--r2) 0 0',
                borderBottom: 'none',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div>
                    <h3 style={{fontSize:'15px',fontWeight:700,color:'var(--t1)',letterSpacing:'-0.2px'}}>
                        📋 Reorder Recommendations
                    </h3>
                    <p style={{fontSize:'13px',color:'var(--t2)',marginTop:'3px'}}>
                        <strong style={{color: needsAction > 0 ? '#D97706' : '#059669'}}>{needsAction}</strong> items need attention
                        {totalOrderValue > 0 && (
                            <> &nbsp;·&nbsp; Estimated order value: <strong>{totalOrderValue.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</strong></>
                        )}
                    </p>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <span style={{fontSize:'12px',color:'var(--t2)'}}>
                        Showing {filteredResults.length} of {results.length} products
                    </span>
                </div>
            </div>

            <div style={{
                background: 'var(--bg1)',
                border: '1px solid var(--bd2)',
                borderTop: 'none',
                borderRadius: '0 0 var(--r2) var(--r2)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <FilterBar filters={filters} toggleFilter={toggleFilter} />

                <div className="tabs">
                    <button className={`tab-btn ${tab === 'tbl' ? 'on' : ''}`} onClick={() => setTab('tbl')}>
                        📋 Table <span style={{fontSize:'12px',opacity:.7}}>({filteredResults.length})</span>
                    </button>
                    <button className={`tab-btn ${tab === 'tl' ? 'on' : ''}`} onClick={() => setTab('tl')}>📅 Timeline</button>
                    <button className={`tab-btn ${tab === 'po' ? 'on' : ''}`} onClick={() => setTab('po')}>📄 PO Draft</button>
                </div>

                <div className={`tab-pane ${tab === 'tbl' ? 'on' : ''}`} id="tab-tbl">
                    <DataTable
                        data={filteredResults}
                        flags={flags} toggleFlag={toggleFlag}
                        overrides={overrides} setOverride={setOverride} clearOverride={clearOverride}
                        notes={notes} setNote={setNote}
                        selectedCodes={selectedCodes} toggleSelection={toggleSelection}
                    />
                </div>

                <div className={`tab-pane ${tab === 'tl' ? 'on' : ''}`} id="tab-tl">
                    <TimelineView data={filteredResults} overrides={overrides} />
                </div>

                <div className={`tab-pane ${tab === 'po' ? 'on' : ''}`} id="tab-po">
                    <PODraft data={filteredResults} overrides={overrides} defCost={defCost} />
                </div>
            </div>
        </div>
    );
}
