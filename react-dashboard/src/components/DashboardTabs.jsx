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
            if (next.has(val)) next.delete(val);
            else next.add(val);
            return { ...prev, [key]: next };
        });
    };

    const filteredResults = useMemo(() => {
        return results.filter(r => {
            // AND logic across categories, OR logic within a category (e.g., checking Urgent OR Watch passes if either is true)
            if (filters.priority && filters.priority.size > 0 && !filters.priority.has(r.priority)) return false;
            
            if (filters.class && filters.class.size > 0) {
                // Determine if the item has X, Y, or Z (usually the last char of the XYZ classification like FX, FZ, or just X)
                const c = r.xyz ? r.xyz.slice(-1) : '';
                if (!filters.class.has(c)) return false;
            }

            if (filters.custom && filters.custom.has('starred') && !flags.has(r.code)) return false;
            
            return true;
        });
    }, [results, filters, flags]);

    if (!results || results.length === 0) return null;

    return (
        <div id="results" className="rd">
            <FilterBar filters={filters} toggleFilter={toggleFilter} />

            <div className="tabs">
                <button className={`tab-btn ${tab === 'tbl' ? 'on' : ''}`} onClick={() => setTab('tbl')}>📋 Table <span style={{fontSize:'12px',opacity:0.7}}>({filteredResults.length})</span></button>
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
    );
}
