import React, { useState, useMemo } from 'react';

export default function DataTable({
    data,
    flags, toggleFlag,
    overrides, setOverride, clearOverride,
    notes, setNote,
    selectedCodes, toggleSelection
}) {
    const [searchQuery, setSearchQuery]   = useState('');
    const [sortCol, setSortCol]           = useState(null);
    const [sortDir, setSortDir]           = useState('asc');
    const [hiddenCols, setHiddenCols]     = useState(new Set());
    const [currentPage, setCurrentPage]   = useState(1);
    const rowsPerPage = 100;

    const toggleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };

    const toggleCol = (col) => {
        setHiddenCols(prev => {
            const next = new Set(prev);
            next.has(col) ? next.delete(col) : next.add(col);
            return next;
        });
    };

    const filteredAndSorted = useMemo(() => {
        let d = data;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            d = d.filter(r =>
                r.name.toLowerCase().includes(q) ||
                r.code.toLowerCase().includes(q) ||
                r.fullName.toLowerCase().includes(q)
            );
        }
        if (sortCol) {
            d = [...d].sort((a, b) => {
                let av = a[sortCol], bv = b[sortCol];
                if (av == null) av = sortDir === 'asc' ? Infinity : -Infinity;
                if (bv == null) bv = sortDir === 'asc' ? Infinity : -Infinity;
                if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
                return sortDir === 'asc' ? av - bv : bv - av;
            });
        }
        return d;
    }, [data, searchQuery, sortCol, sortDir]);

    React.useEffect(() => { setCurrentPage(1); }, [filteredAndSorted.length]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
    const paginatedData = filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const urg = data.filter(r => r.priority === 'urgent').length;
    const ord = data.filter(r => r.priority === 'order').length;
    const wat = data.filter(r => r.priority === 'watch').length;
    const ok  = data.filter(r => r.priority === 'ok').length;
    const tot = data.reduce((s, r) => s + (overrides[r.code] !== undefined ? overrides[r.code] : (r.oq || 0)), 0);

    const isHidden = col => hiddenCols.has(col);

    const handleExportCsv = () => {
        const cols = [
            { h: 'Code',         fn: r => r.code },
            { h: 'Product',      fn: r => r.name },
            { h: 'Priority',     fn: r => r.priority },
            { h: 'Type',         fn: r => r.label },
            { h: 'XYZ',          fn: r => r.xyz },
            { h: 'Stock',        fn: r => r.stock },
            { h: 'On Order',     fn: r => r.onOrder || 0 },
            { h: 'Days Left',    fn: r => r.days ?? '' },
            { h: 'Run Rate/mo',  fn: r => r.ms },
            { h: 'Reorder Pt',   fn: r => r.rp },
            { h: 'Max Target',   fn: r => r.mq },
            { h: 'Order Qty',    fn: r => overrides[r.code] !== undefined ? overrides[r.code] : r.oq },
            { h: 'Trend %',      fn: r => r.trend ?? '' },
            { h: 'Unit Cost',    fn: r => r.cost > 0 ? r.cost : '' },
            { h: 'Order Value',  fn: r => r.oval > 0 ? r.oval : '' },
            { h: 'Reason',       fn: r => r.reason },
            { h: 'Note',         fn: r => notes[r.code] || '' },
        ];
        const esc = v => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s; };
        const csv = [cols.map(c => esc(c.h)).join(','), ...filteredAndSorted.map(r => cols.map(c => esc(c.fn(r))).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reorder_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyAll = () => {
        const codes = filteredAndSorted.map(r => r.code).join('\n');
        navigator.clipboard.writeText(codes).then(() => alert(`Copied ${filteredAndSorted.length} codes`));
    };

    const pp = p => {
        const base = "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-tight";
        switch (p) {
            case 'urgent': return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`}>🔴 Urgent</span>;
            case 'order':  return <span className={`${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`}>🟡 Order Now</span>;
            case 'watch':  return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`}>🔵 Watch</span>;
            default:       return <span className={`${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300`}>🟢 OK</span>;
        }
    };
    const lp = l => l === 'fast' ? <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">Fast</span> : <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400">Slow</span>;

    const dayBar = d => {
        if (d === null) return <span className="text-slate-400 text-[11px] italic dark:text-slate-500">N/A</span>;
        const pct = Math.min(100, Math.round((d / 90) * 100));
        const colClass = d <= 7 ? 'bg-red-500' : d <= 30 ? 'bg-amber-500' : 'bg-emerald-500';
        const txtClass = d <= 7 ? 'text-red-600 font-bold dark:text-red-400' : d <= 30 ? 'text-amber-600 font-semibold dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';
        return <div className="day-bar-wrap"><div className="day-bar-bg"><div className={`day-bar-fg ${colClass}`} style={{width:`${pct}%`}}></div></div><span className={txtClass}>{d}d</span></div>;
    };

    const trendCell = r => {
        if (r.trend === null) return <span className="text-slate-400 text-[11px] italic dark:text-slate-500">—</span>;
        if (r.trend === 999)  return <span className="text-emerald-600 font-bold text-xs dark:text-emerald-500">New ↑</span>;
        return r.trend > 0 ? <span className="text-emerald-600 font-bold text-xs dark:text-emerald-500">↑{r.trend}%</span> : r.trend < 0 ? <span className="text-red-600 font-bold text-xs dark:text-red-500">↓{Math.abs(r.trend)}%</span> : <span className="text-slate-400 text-[11px] italic dark:text-slate-500">0%</span>;
    };

    // Table specific Tailwind defaults
    const thClass = "font-bold text-[11px] text-slate-500 px-3.5 py-3 border-b border-slate-200 bg-slate-50 whitespace-nowrap uppercase tracking-wider dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700/80 dark:hover:text-slate-200 transition-colors";
    const tdClass = "px-3.5 py-2.5 border-b border-slate-200 text-slate-900 align-middle group-hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:group-hover:bg-slate-800/40 transition-colors";

    return (
        <div>
            {/* ── Metric Cards ── */}
            <div className="metrics">
                <div className="metric">
                    <span className="metric-icon">📦</span>
                    <div className="mlb">Total Products</div>
                    <div className="mv">{data.length}</div>
                </div>
                <div className="metric m-urgent">
                    <span className="metric-icon">🚨</span>
                    <div className="mlb">Urgent</div>
                    <div className="mv">{urg}</div>
                </div>
                <div className="metric m-order">
                    <span className="metric-icon">🛒</span>
                    <div className="mlb">Order Now</div>
                    <div className="mv">{ord}</div>
                </div>
                <div className="metric m-watch">
                    <span className="metric-icon">👁</span>
                    <div className="mlb">Watch</div>
                    <div className="mv">{wat}</div>
                </div>
                <div className="metric m-ok">
                    <span className="metric-icon">✅</span>
                    <div className="mlb">OK</div>
                    <div className="mv">{ok}</div>
                </div>
                <div className="metric m-flag">
                    <span className="metric-icon">🏷</span>
                    <div className="mlb">Units to Order</div>
                    <div className="mv">{tot.toLocaleString()}</div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex gap-2 mb-2.5 items-center flex-wrap p-2.5 bg-slate-100 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <p className="text-[13px] font-bold text-slate-900 m-0 whitespace-nowrap tracking-wide px-2 dark:text-slate-100">Reorder List</p>
                <input
                    type="text"
                    placeholder="🔍 Search by name or part number…"
                    className="flex-1 min-w-[200px] text-[13px] px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-accent-dark/30 dark:focus:border-accent-dark"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" onClick={() => document.getElementById('col-tog-react').classList.toggle('hidden')}>⚙ Columns</button>
                <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" onClick={handleCopyAll}>⎘ Copy Part Nos.</button>
                <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" onClick={handleExportCsv}>⬇ Export CSV</button>
            </div>

            <div className="hidden flex-wrap gap-1.5 bg-slate-100 p-2.5 rounded-xl mb-2.5 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700" id="col-tog-react">
                {[
                    {id:'type',    label:'Type'},
                    {id:'xyz',     label:'XYZ Class'},
                    {id:'onorder', label:'On Order'},
                    {id:'days',    label:'Days Left'},
                    {id:'rate',    label:'Run Rate'},
                    {id:'rp',      label:'Reorder Point (Min)'},
                    {id:'mq',      label:'Max Target'},
                    {id:'reason',  label:'Reason'},
                    {id:'trend',   label:'Trend %'},
                    {id:'cost',    label:'Unit Cost'},
                    {id:'oval',    label:'Order Value'},
                    {id:'note',    label:'Note'},
                ].map(c => (
                    <label key={c.id} className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer px-3 py-1.5 rounded-full border border-slate-300 bg-white whitespace-nowrap transition-colors hover:border-accent hover:text-accent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-400 dark:hover:border-accent-dark dark:hover:text-accent-dark">
                        <input className="accent-accent dark:accent-accent-dark" type="checkbox" checked={!hiddenCols.has(c.id)} onChange={() => toggleCol(c.id)} /> {c.label}
                    </label>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="max-w-full overflow-x-auto mb-6 border border-slate-200 rounded-xl shadow-sm dark:border-slate-700">
                <table className="w-full border-collapse text-[13px] text-left">
                    <thead>
                        <tr>
                            <th className={thClass}><input type="checkbox" className="row-cb" onChange={e => {
                                const active = e.target.checked;
                                document.querySelectorAll('.rcb').forEach(cb => { if (cb.checked !== active) cb.click(); });
                            }} /></th>
                            <th className={thClass} title="Flag">★</th>
                            <th className={`${thClass} ${sortCol === 'priority' ? sortDir : ''}`} onClick={() => toggleSort('priority')}>Priority</th>
                            <th className={thClass}>Part No.</th>
                            <th className={`${thClass} ${sortCol === 'name' ? sortDir : ''}`} onClick={() => toggleSort('name')}>Product</th>
                            {!isHidden('type')    && <th className={`${thClass} ${sortCol === 'label'   ? sortDir : ''}`} onClick={() => toggleSort('label')}>Type</th>}
                            {!isHidden('xyz')     && <th className={`${thClass} ${sortCol === 'xyz'     ? sortDir : ''}`} onClick={() => toggleSort('xyz')}>XYZ</th>}
                            <th className={`${thClass} ${sortCol === 'stock' ? sortDir : ''}`} onClick={() => toggleSort('stock')}>Stock</th>
                            {!isHidden('onorder') && <th className={`${thClass} ${sortCol === 'onOrder' ? sortDir : ''}`} onClick={() => toggleSort('onOrder')}>On Order</th>}
                            {!isHidden('days')    && <th className={`${thClass} ${sortCol === 'days'    ? sortDir : ''}`} onClick={() => toggleSort('days')}>Days Left</th>}
                            {!isHidden('rate')    && <th className={`${thClass} ${sortCol === 'ms'      ? sortDir : ''}`} onClick={() => toggleSort('ms')}>Run Rate</th>}
                            {!isHidden('rp')      && <th className={`${thClass} ${sortCol === 'rp'      ? sortDir : ''}`} onClick={() => toggleSort('rp')}>Min<br/><span className="text-[9px] font-normal opacity-70">(Reorder Pt)</span></th>}
                            {!isHidden('mq')      && <th className={`${thClass} ${sortCol === 'mq'      ? sortDir : ''}`} onClick={() => toggleSort('mq')}>Max Target</th>}
                            <th className={`${thClass} ${sortCol === 'oq'    ? sortDir : ''}`} onClick={() => toggleSort('oq')}>Order Qty</th>
                            {!isHidden('trend')   && <th className={`${thClass} ${sortCol === 'trend'   ? sortDir : ''}`} onClick={() => toggleSort('trend')}>Trend</th>}
                            {!isHidden('cost')    && <th className={`${thClass} ${sortCol === 'cost'    ? sortDir : ''}`} onClick={() => toggleSort('cost')}>Cost</th>}
                            {!isHidden('oval')    && <th className={`${thClass} ${sortCol === 'oval'    ? sortDir : ''}`} onClick={() => toggleSort('oval')}>Order Value</th>}
                            {!isHidden('reason')  && <th className={thClass}>Reason</th>}
                            {!isHidden('note')    && <th className={thClass}>Note</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 border-none">
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="20" className="border-none py-12">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="text-5xl opacity-40 leading-none">🔍</div>
                                        <div className="text-[15px] font-semibold text-slate-700 mt-1 dark:text-slate-300">No products match your filters</div>
                                        <div className="text-[13px] text-center max-w-[300px]">Try adjusting the filter tags above or clearing the search field</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {paginatedData.map(r => {
                            const sc      = r.code;
                            const ov      = overrides[sc];
                            const note    = notes[sc] || '';
                            const starred = flags.has(sc);
                            const isSel   = selectedCodes.has(sc);

                            const handleCopyCode = (e) => {
                                navigator.clipboard.writeText(sc);
                                e.target.textContent = '✓';
                                setTimeout(() => e.target.textContent = '⎘ Copy', 1000);
                            };

                            return (
                                <tr key={sc} className={`group last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${starred ? 'bg-amber-50 dark:bg-amber-900/10' : ''} ${isSel ? 'bg-accent-bg dark:bg-accent-bg-dark' : ''}`}>
                                    <td className={tdClass}><input type="checkbox" className="row-cb rcb" checked={isSel} onChange={() => toggleSelection(sc)} /></td>
                                    <td className={tdClass}><button className={`star ${starred ? 'on' : ''}`} onClick={() => toggleFlag(sc)} title="Flag row">{starred ? '★' : '☆'}</button></td>
                                    <td className={tdClass}>{pp(r.priority)}</td>
                                    <td className={tdClass}><div className="cc"><span className="ct2" title={r.code}>{r.code}</span><button className="cpb" onClick={handleCopyCode}>⎘ Copy</button></div></td>
                                    <td className={tdClass}><div className="pname" title={r.fullName}>{r.name}</div></td>
                                    {!isHidden('type')    && <td className={tdClass}>{lp(r.label)}</td>}
                                    {!isHidden('xyz')     && <td className={`${tdClass} font-semibold`}>{r.xyz.charAt(0)}{r.xf > 1 && <span className="text-[10px] text-slate-500 font-normal ml-1 dark:text-slate-400">×{r.xf}</span>}</td>}
                                    <td className={`${tdClass} ${r.stock < 0 ? 'text-red-600 font-bold dark:text-red-400' : ''}`}>{r.stock.toLocaleString()}</td>
                                    {!isHidden('onorder') && <td className={`${tdClass} text-slate-500 text-[13px] dark:text-slate-400`}>{r.onOrder > 0 ? r.onOrder : '—'}</td>}
                                    {!isHidden('days')    && <td className={tdClass}>{dayBar(r.days)}</td>}
                                    {!isHidden('rate')    && <td className={`${tdClass} tabular-nums`}>{r.ms}<span className="text-[11px] text-slate-500 dark:text-slate-400">/mo</span></td>}
                                    {!isHidden('rp')      && <td className={`${tdClass} text-accent font-bold dark:text-accent-dark`}>{r.rp}</td>}
                                    {!isHidden('mq')      && <td className={`${tdClass} text-slate-500 font-semibold dark:text-slate-400`}>{r.mq}</td>}
                                    <td className={tdClass}>
                                        <input
                                            type="number"
                                            className={ov !== undefined ? 'qty-input overridden' : 'qty-input'}
                                            placeholder={r.oq > 0 ? r.oq : '—'}
                                            value={ov !== undefined ? ov : ''}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '') clearOverride(sc);
                                                else setOverride(sc, parseInt(v));
                                            }}
                                        />
                                    </td>
                                    {!isHidden('trend')  && <td className={tdClass}>{trendCell(r)}</td>}
                                    {!isHidden('cost')   && <td className={`${tdClass} tabular-nums`}>{r.cost > 0 ? r.cost.toFixed(2) : '—'}</td>}
                                    {!isHidden('oval')   && <td className={`${tdClass} font-bold tabular-nums`}>{r.oval > 0 ? r.oval.toLocaleString() : '—'}</td>}
                                    {!isHidden('reason') && <td className={`${tdClass} text-[12px] text-slate-500 max-w-[180px] dark:text-slate-400`}>{r.reason}</td>}
                                    {!isHidden('note')   && (
                                        <td className={tdClass}>
                                            <input
                                                type="text"
                                                className="note-input"
                                                value={note}
                                                placeholder="Add note…"
                                                onChange={e => setNote(sc, e.target.value)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between sm:justify-center items-center gap-3 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800/50 dark:border-slate-700 flex-wrap">
                <span className="text-[13px] text-slate-500 dark:text-slate-400">
                    {filteredAndSorted.length === 0 ? 'No results' :
                     `Showing ${(currentPage-1)*rowsPerPage+1}–${Math.min(currentPage*rowsPerPage, filteredAndSorted.length)} of ${filteredAndSorted.length}`}
                </span>
                <div className="flex gap-1.5">
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" disabled={currentPage===1} onClick={() => setCurrentPage(1)}>« First</button>
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" disabled={currentPage===1} onClick={() => setCurrentPage(p => p-1)}>‹ Prev</button>
                    <span className="px-3.5 py-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">Page {currentPage} / {totalPages}</span>
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p => p+1)}>Next ›</button>
                    <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all whitespace-nowrap hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100" disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}>Last »</button>
                </div>
            </div>
        </div>
    );
}
