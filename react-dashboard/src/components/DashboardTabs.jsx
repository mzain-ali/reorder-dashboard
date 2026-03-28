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

    const baseTab = "text-[13px] font-semibold px-4.5 py-2.5 bg-transparent border-none rounded-t-lg text-slate-500 cursor-pointer transition-all -mb-[2px] border-b-2 border-transparent hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50";
    const activeTab = "!text-accent !border-accent !bg-accent-bg dark:!text-accent-dark dark:!border-accent-dark dark:!bg-accent-bg-dark";

    return (
        <div id="results">
            {/* Results summary strip */}
            <div className="flex items-center justify-between p-3.5 px-5 bg-white border border-slate-200 rounded-t-xl border-b-0 flex-wrap gap-3 dark:bg-slate-800 dark:border-slate-700">
                <div>
                    <h3 className="text-[15px] font-bold text-slate-900 tracking-tight dark:text-slate-100">
                        📋 Reorder Recommendations
                    </h3>
                    <p className="text-[13px] text-slate-500 mt-1 dark:text-slate-400">
                        <strong className={needsAction > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}>{needsAction}</strong> items need attention
                        {totalOrderValue > 0 && (
                            <> <span className="opacity-40">·</span> Estimated order value: <strong className="text-slate-900 dark:text-slate-200">{totalOrderValue.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</strong></>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Showing {filteredResults.length} of {results.length} products
                    </span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <FilterBar filters={filters} toggleFilter={toggleFilter} />

                <div className="flex gap-1 mb-5 border-b-2 border-slate-200 dark:border-slate-700">
                    <button className={`${baseTab} ${tab === 'tbl' ? activeTab : ''}`} onClick={() => setTab('tbl')}>
                        📋 Table <span className="text-xs opacity-70">({filteredResults.length})</span>
                    </button>
                    <button className={`${baseTab} ${tab === 'tl' ? activeTab : ''}`} onClick={() => setTab('tl')}>📅 Timeline</button>
                    <button className={`${baseTab} ${tab === 'po' ? activeTab : ''}`} onClick={() => setTab('po')}>📄 PO Draft</button>
                </div>

                <div className={tab === 'tbl' ? 'block' : 'hidden'} id="tab-tbl">
                    <DataTable
                        data={filteredResults}
                        flags={flags} toggleFlag={toggleFlag}
                        overrides={overrides} setOverride={setOverride} clearOverride={clearOverride}
                        notes={notes} setNote={setNote}
                        selectedCodes={selectedCodes} toggleSelection={toggleSelection}
                    />
                </div>

                <div className={tab === 'tl' ? 'block' : 'hidden'} id="tab-tl">
                    <TimelineView data={filteredResults} overrides={overrides} />
                </div>

                <div className={tab === 'po' ? 'block' : 'hidden'} id="tab-po">
                    <PODraft data={filteredResults} overrides={overrides} defCost={defCost} />
                </div>
            </div>
        </div>
    );
}
