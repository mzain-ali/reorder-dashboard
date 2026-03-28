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

    // Filtering: only search — priority/type handled by FilterBar upstream
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

    // Metrics from full (unfiltered) data
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

    // Renders
    const pp = p =>
        p === 'urgent' ? <span className="pill p-ur">🔴 Urgent</span> :
        p === 'order'  ? <span className="pill p-or">🟡 Order Now</span> :
        p === 'watch'  ? <span className="pill p-wa">🔵 Watch</span> :
                         <span className="pill p-ok">🟢 OK</span>;

    const lp = l => l === 'fast' ? <span className="pill t-f">Fast</span> : <span className="pill t-s">Slow</span>;

    const dayBar = d => {
        if (d === null) return <span className="tr-na">N/A</span>;
        const pct = Math.min(100, Math.round((d / 90) * 100));
        const col = d <= 7 ? '#EF4444' : d <= 30 ? '#F59E0B' : '#10B981';
        const cls = d <= 7 ? 'd-crit' : d <= 30 ? 'd-warn' : 'd-ok';
        return <div className="day-bar-wrap"><div className="day-bar-bg"><div className="day-bar-fg" style={{width:`${pct}%`,background:col}}></div></div><span className={cls}>{d}d</span></div>;
    };

    const trendCell = r => {
        if (r.trend === null) return <span className="tr-na">—</span>;
        if (r.trend === 999)  return <span className="tr-up">New ↑</span>;
        return r.trend > 0 ? <span className="tr-up">↑{r.trend}%</span> : r.trend < 0 ? <span className="tr-dn">↓{Math.abs(r.trend)}%</span> : <span className="tr-na">0%</span>;
    };

    return (
        <div>
            {/* ── Color-coded Metric Cards ── */}
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

            {/* ── Toolbar (search + columns + export — no duplicate filters) ── */}
            <div className="frow">
                <p className="sh">Reorder List</p>
                <input
                    type="text"
                    placeholder="🔍 Search by name or part number…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="ibtn" onClick={() => document.getElementById('col-tog-react').classList.toggle('on')}>⚙ Columns</button>
                <button className="ibtn" onClick={handleCopyAll}>⎘ Copy Part Nos.</button>
                <button className="ibtn" onClick={handleExportCsv}>⬇ Export CSV</button>
            </div>

            <div className="ctog" id="col-tog-react">
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
                    <label key={c.id}>
                        <input type="checkbox" checked={!hiddenCols.has(c.id)} onChange={() => toggleCol(c.id)} /> {c.label}
                    </label>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="tw">
                <table id="main-tbl">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className="row-cb" onChange={e => {
                                const active = e.target.checked;
                                document.querySelectorAll('.rcb').forEach(cb => { if (cb.checked !== active) cb.click(); });
                            }} /></th>
                            <th title="Flag">★</th>
                            <th className={`sort ${sortCol === 'priority' ? sortDir : ''}`} onClick={() => toggleSort('priority')}>Priority</th>
                            <th>Part No.</th>
                            <th className={`sort ${sortCol === 'name' ? sortDir : ''}`} onClick={() => toggleSort('name')}>Product</th>
                            {!isHidden('type')    && <th className={`sort ${sortCol === 'label'   ? sortDir : ''}`} onClick={() => toggleSort('label')}>Type</th>}
                            {!isHidden('xyz')     && <th className={`sort ${sortCol === 'xyz'     ? sortDir : ''}`} onClick={() => toggleSort('xyz')}>XYZ</th>}
                            <th className={`sort ${sortCol === 'stock' ? sortDir : ''}`} onClick={() => toggleSort('stock')}>Stock</th>
                            {!isHidden('onorder') && <th className={`sort ${sortCol === 'onOrder' ? sortDir : ''}`} onClick={() => toggleSort('onOrder')}>On Order</th>}
                            {!isHidden('days')    && <th className={`sort ${sortCol === 'days'    ? sortDir : ''}`} onClick={() => toggleSort('days')}>Days Left</th>}
                            {!isHidden('rate')    && <th className={`sort ${sortCol === 'ms'      ? sortDir : ''}`} onClick={() => toggleSort('ms')}>Run Rate</th>}
                            {!isHidden('rp')      && <th className={`sort ${sortCol === 'rp'      ? sortDir : ''}`} onClick={() => toggleSort('rp')}>Min<br/><span style={{fontSize:'9px',fontWeight:'normal',opacity:.7}}>(Reorder Pt)</span></th>}
                            {!isHidden('mq')      && <th className={`sort ${sortCol === 'mq'      ? sortDir : ''}`} onClick={() => toggleSort('mq')}>Max Target</th>}
                            <th className={`sort ${sortCol === 'oq'    ? sortDir : ''}`} onClick={() => toggleSort('oq')}>Order Qty</th>
                            {!isHidden('trend')   && <th className={`sort ${sortCol === 'trend'   ? sortDir : ''}`} onClick={() => toggleSort('trend')}>Trend</th>}
                            {!isHidden('cost')    && <th className={`sort ${sortCol === 'cost'    ? sortDir : ''}`} onClick={() => toggleSort('cost')}>Cost</th>}
                            {!isHidden('oval')    && <th className={`sort ${sortCol === 'oval'    ? sortDir : ''}`} onClick={() => toggleSort('oval')}>Order Value</th>}
                            {!isHidden('reason')  && <th>Reason</th>}
                            {!isHidden('note')    && <th>Note</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="20">
                                    <div className="empty-state">
                                        <div className="es-icon">🔍</div>
                                        <div className="es-title">No products match your filters</div>
                                        <div className="es-sub">Try adjusting the filter tags above or clearing the search field</div>
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
                                <tr key={sc} className={starred ? 'flagged' : ''} style={isSel ? {background:'var(--accent-bg)'} : {}}>
                                    <td><input type="checkbox" className="row-cb rcb" checked={isSel} onChange={() => toggleSelection(sc)} /></td>
                                    <td><button className={`star ${starred ? 'on' : ''}`} onClick={() => toggleFlag(sc)} title="Flag row">{starred ? '★' : '☆'}</button></td>
                                    <td>{pp(r.priority)}</td>
                                    <td><div className="cc"><span className="ct2" title={r.code}>{r.code}</span><button className="cpb" onClick={handleCopyCode}>⎘ Copy</button></div></td>
                                    <td><div className="pname" title={r.fullName}>{r.name}</div></td>
                                    {!isHidden('type')    && <td>{lp(r.label)}</td>}
                                    {!isHidden('xyz')     && <td style={{fontWeight:600}}>{r.xyz.charAt(0)}{r.xf > 1 && <span style={{fontSize:'10px',color:'var(--t2)',fontWeight:400}}> ×{r.xf}</span>}</td>}
                                    <td className={r.stock < 0 ? 'neg' : ''}>{r.stock.toLocaleString()}</td>
                                    {!isHidden('onorder') && <td style={{color:'var(--t2)',fontSize:'13px'}}>{r.onOrder > 0 ? r.onOrder : '—'}</td>}
                                    {!isHidden('days')    && <td>{dayBar(r.days)}</td>}
                                    {!isHidden('rate')    && <td style={{fontVariantNumeric:'tabular-nums'}}>{r.ms}<span style={{fontSize:'11px',color:'var(--t2)'}}>/mo</span></td>}
                                    {!isHidden('rp')      && <td style={{color:'var(--accent)',fontWeight:700}}>{r.rp}</td>}
                                    {!isHidden('mq')      && <td style={{color:'var(--t2)',fontWeight:600}}>{r.mq}</td>}
                                    <td>
                                        {/* Bug 1 fix: empty → clearOverride */}
                                        <input
                                            type="number"
                                            className={ov !== undefined ? 'qi ov' : 'qi'}
                                            placeholder={r.oq > 0 ? r.oq : '—'}
                                            value={ov !== undefined ? ov : ''}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '') clearOverride(sc);
                                                else setOverride(sc, parseInt(v));
                                            }}
                                            style={{width:'58px'}}
                                        />
                                    </td>
                                    {!isHidden('trend')  && <td>{trendCell(r)}</td>}
                                    {!isHidden('cost')   && <td style={{fontVariantNumeric:'tabular-nums'}}>{r.cost > 0 ? r.cost.toFixed(2) : '—'}</td>}
                                    {!isHidden('oval')   && <td style={{fontWeight:700,fontVariantNumeric:'tabular-nums'}}>{r.oval > 0 ? r.oval.toLocaleString() : '—'}</td>}
                                    {!isHidden('reason') && <td style={{fontSize:'12px',color:'var(--t2)',maxWidth:'180px'}}>{r.reason}</td>}
                                    {/* Bug 4 fix: notes editable inline */}
                                    {!isHidden('note')   && (
                                        <td>
                                            <input
                                                type="text"
                                                className="ni"
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
            <div className="pagination">
                <span style={{fontSize:'13px',color:'var(--t2)'}}>
                    {filteredAndSorted.length === 0 ? 'No results' :
                     `Showing ${(currentPage-1)*rowsPerPage+1}–${Math.min(currentPage*rowsPerPage, filteredAndSorted.length)} of ${filteredAndSorted.length}`}
                </span>
                <div style={{display:'flex',gap:'5px'}}>
                    <button className="ibtn" disabled={currentPage===1} onClick={() => setCurrentPage(1)}>« First</button>
                    <button className="ibtn" disabled={currentPage===1} onClick={() => setCurrentPage(p => p-1)}>‹ Prev</button>
                    <span style={{padding:'7px 14px',fontSize:'13px',fontWeight:600}}>Page {currentPage} / {totalPages}</span>
                    <button className="ibtn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p => p+1)}>Next ›</button>
                    <button className="ibtn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(totalPages)}>Last »</button>
                </div>
            </div>
        </div>
    );
}
