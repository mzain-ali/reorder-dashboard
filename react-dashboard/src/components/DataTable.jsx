import React, { useState, useMemo } from 'react';

export default function DataTable({ 
    data, 
    flags, toggleFlag, 
    overrides, setOverride, 
    notes, setNote,
    selectedCodes, toggleSelection
}) {
    // 1. Local UI State
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [hiddenCols, setHiddenCols] = useState(new Set()); // Which cols to hide
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 100;

    // 2. Handlers
    const toggleSort = (col) => {
        if (sortCol === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };
    
    const toggleCol = (col) => {
        setHiddenCols(prev => {
            const next = new Set(prev);
            if (next.has(col)) next.delete(col);
            else next.add(col);
            return next;
        });
    };
    
    // 3. Derived Data (Filter & Sort)
    const filteredAndSorted = useMemo(() => {
        let d = data;
        if (filterPriority === 'need') d = d.filter(r => r.priority !== 'ok');
        else if (filterPriority !== 'all') d = d.filter(r => r.priority === filterPriority);
        if (filterType !== 'all') d = d.filter(r => r.label === filterType);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            d = d.filter(r => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q));
        }
        
        if (sortCol) {
            d = [...d].sort((a, b) => {
                let av = a[sortCol], bv = b[sortCol];
                if (av === null || av === undefined) av = sortDir === 'asc' ? Infinity : -Infinity;
                if (bv === null || bv === undefined) bv = sortDir === 'asc' ? Infinity : -Infinity;
                if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
                return sortDir === 'asc' ? av - bv : bv - av;
            });
        }
        return d;
    }, [data, filterPriority, filterType, searchQuery, sortCol, sortDir]);

    // Reset page to 1 when filters change to avoid empty pages
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filteredAndSorted.length]);

    // Pagination Derivation
    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
    const paginatedData = filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // 4. Metrics
    const urg = data.filter(r => r.priority === 'urgent').length;
    const ord = data.filter(r => r.priority === 'order').length;
    const wat = data.filter(r => r.priority === 'watch').length;
    const tot = data.reduce((s, r) => s + (overrides[r.code] !== undefined ? overrides[r.code] : (r.oq || 0)), 0);

    const isHidden = (col) => hiddenCols.has(col);
    const thClass = (col) => {
        let cls = isHidden(col) ? ' hidden' : '';
        if (sortCol === col) cls += ' sort ' + sortDir;
        return cls;
    };

    const handleCopyAll = () => {
        const codes = filteredAndSorted.map(r => r.code).join('\n');
        navigator.clipboard.writeText(codes).then(() => alert(`Copied ${filteredAndSorted.length} codes`));
    };

    return (
        <div>
            {/* Metrics */}
            <div className="metrics">
                <div className="metric"><div className="mlb">Total</div><div className="mv">{data.length}</div></div>
                <div className="metric"><div className="mlb" style={{color:'#991B1B'}}>Urgent</div><div className="mv" style={{color:'#991B1B'}}>{urg}</div></div>
                <div className="metric"><div className="mlb" style={{color:'#92400E'}}>Order Now</div><div className="mv" style={{color:'#92400E'}}>{ord}</div></div>
                <div className="metric"><div className="mlb" style={{color:'#1E40AF'}}>Watch</div><div className="mv" style={{color:'#1E40AF'}}>{wat}</div></div>
                <div className="metric"><div className="mlb">Units to Order</div><div className="mv">{tot.toLocaleString()}</div></div>
                <div className="metric"><div className="mlb" style={{color:'#F59E0B'}}>Flagged</div><div className="mv" style={{color:'#F59E0B'}}>{flags.size}</div></div>
            </div>

            {/* Toolbar */}
            <div className="frow">
                <p className="sh">Reorder List</p>
                <input type="text" placeholder="Search name or code…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="all">All Priorities</option>
                    <option value="need">Needs Action</option>
                    <option value="urgent">Urgent</option>
                    <option value="order">Order Now</option>
                    <option value="watch">Watch</option>
                    <option value="ok">OK</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="all">Both Types</option>
                    <option value="fast">Fast Moving</option>
                    <option value="slow">Slow Moving</option>
                </select>
                <button className="ibtn" onClick={() => document.getElementById('col-tog-react').classList.toggle('on')}>⚙ Columns</button>
                <button className="ibtn" onClick={handleCopyAll} style={{ background: 'var(--bg3)' }}>⎘ Copy Part Nos.</button>
            </div>

            <div className="ctog" id="col-tog-react">
                {[
                    {id: 'type', label: 'Type'},
                    {id: 'xyz', label: 'XYZ'},
                    {id: 'days', label: 'Days Left'},
                    {id: 'rate', label: 'Run Rate'},
                    {id: 'rp', label: 'Calculated Min (Reorder Pt)'},
                    {id: 'mq', label: 'Calculated Max'},
                    {id: 'reason', label: 'Reason'},
                    {id: 'trend', label: 'Trend'},
                    {id: 'cost', label: 'Cost'},
                    {id: 'oval', label: 'Order Value'}
                ].map(c => (
                    <label key={c.id}>
                        <input type="checkbox" checked={!hiddenCols.has(c.id)} onChange={() => toggleCol(c.id)} /> {c.label}
                    </label>
                ))}
            </div>

            <div className="tw">
                <table id="main-tbl">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className="row-cb" onChange={e => {
                                const active = e.target.checked;
                                document.querySelectorAll('.rcb').forEach(cb => {
                                    if (cb.checked !== active) cb.click();
                                });
                            }} /></th>
                            <th title="Flag">★</th>
                            <th className={`sort ${sortCol === 'priority' ? sortDir : ''}`} onClick={() => toggleSort('priority')}>Priority</th>
                            <th>Code</th>
                            <th className={`sort ${sortCol === 'name' ? sortDir : ''}`} onClick={() => toggleSort('name')}>Product</th>
                            {!isHidden('type') && <th className={`c-type sort ${sortCol === 'label' ? sortDir : ''}`} onClick={() => toggleSort('label')}>Type</th>}
                            {!isHidden('xyz') && <th className={`c-xyz sort ${sortCol === 'xyz' ? sortDir : ''}`} onClick={() => toggleSort('xyz')}>XYZ</th>}
                            <th className={`sort ${sortCol === 'stock' ? sortDir : ''}`} onClick={() => toggleSort('stock')}>Stock</th>
                            {!isHidden('days') && <th className={`c-days sort ${sortCol === 'days' ? sortDir : ''}`} onClick={() => toggleSort('days')}>Days Left</th>}
                            {!isHidden('rate') && <th className={`c-rate sort ${sortCol === 'ms' ? sortDir : ''}`} onClick={() => toggleSort('ms')}>Run Rate</th>}
                            {!isHidden('rp') && <th className={`c-rp sort ${sortCol === 'rp' ? sortDir : ''}`} onClick={() => toggleSort('rp')}>Calculated Min<br/><span style={{fontSize:'10px',fontWeight:'normal'}}>(Reorder Pt)</span></th>}
                            {!isHidden('mq') && <th className={`c-mq sort ${sortCol === 'mq' ? sortDir : ''}`} onClick={() => toggleSort('mq')}>Calculated Max</th>}
                            <th className={`sort ${sortCol === 'oq' ? sortDir : ''}`} onClick={() => toggleSort('oq')}>Order Qty</th>
                            {!isHidden('trend') && <th className={`sort ${sortCol === 'trend' ? sortDir : ''}`} onClick={() => toggleSort('trend')}>Trend</th>}
                            {!isHidden('cost') && <th className={`sort ${sortCol === 'cost' ? sortDir : ''}`} onClick={() => toggleSort('cost')}>Cost</th>}
                            {!isHidden('oval') && <th className={`sort ${sortCol === 'oval' ? sortDir : ''}`} onClick={() => toggleSort('oval')}>Order Value</th>}
                            {!isHidden('reason') && <th className="c-reason">Reason</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 && (
                            <tr><td colSpan="17" className="norow">No products match filters.</td></tr>
                        )}
                        {paginatedData.map(r => {
                            const sc = r.code;
                            const ov = overrides[sc];
                            const qshow = ov !== undefined ? ov : (r.oq > 0 ? r.oq : '—');
                            const qcls = ov !== undefined ? 'qi ov' : 'qi';
                            const note = notes[sc] || '';
                            const starred = flags.has(sc);

                            const pp = p => p === 'urgent' ? <span className="pill p-ur">Urgent</span> : p === 'order' ? <span className="pill p-or">Order Now</span> : p === 'watch' ? <span className="pill p-wa">Watch</span> : <span className="pill p-ok">OK</span>;
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
                                if (r.trend === 999) return <span className="tr-up">New ↑</span>;
                                return r.trend > 0 ? <span className="tr-up">↑{r.trend}%</span> : r.trend < 0 ? <span className="tr-dn">↓{Math.abs(r.trend)}%</span> : <span className="tr-na">0%</span>;
                            };

                            const handleCopyCode = (e) => {
                                navigator.clipboard.writeText(sc);
                                e.target.textContent = '✓';
                                setTimeout(() => e.target.textContent = '⎘ Copy', 1000);
                            };

                            const isSelected = selectedCodes.has(sc);

                            return (
                                <tr key={sc} className={starred ? 'flagged' : ''} style={isSelected ? {background:'var(--bg2)'} : {}}>
                                    <td><input type="checkbox" className="row-cb rcb" checked={isSelected} onChange={() => toggleSelection(sc)} /></td>
                                    <td><button className={`star ${starred?'on':''}`} onClick={() => toggleFlag(sc)} title="Flag row">{starred ? '★' : '☆'}</button></td>
                                    <td>{pp(r.priority)}</td>
                                    <td className="c-code"><div className="cc"><span className="ct2" title={r.code}>{r.code}</span><button className="cpb" onClick={handleCopyCode} title="Copy full code">⎘ Copy</button></div></td>
                                    <td><div className="pname" title={r.fullName}>{r.name}</div></td>
                                    {!isHidden('type') && <td className="c-type">{lp(r.label)}</td>}
                                    {!isHidden('xyz') && <td className="c-xyz">{r.xyz.charAt(0)}{r.xf > 1 && <span style={{fontSize:'10px',color:'var(--t2)'}}> ×{r.xf}</span>}</td>}
                                    <td className={r.stock < 0 ? 'neg' : ''}>{r.stock}</td>
                                    {!isHidden('days') && <td className="c-days">{dayBar(r.days)}</td>}
                                    {!isHidden('rate') && <td className="c-rate">{r.ms}/mo</td>}
                                    {!isHidden('rp') && <td className="c-rp" style={{color:'var(--t2)', fontWeight: 600}}>{r.rp}</td>}
                                    {!isHidden('mq') && <td className="c-mq" style={{color:'var(--t2)', fontWeight: 600}}>{r.mq}</td>}
                                    
                                    <td>
                                        <input 
                                            type="number" 
                                            className={ov !== undefined ? 'qi ov' : 'qi'}
                                            placeholder={r.oq > 0 ? r.oq : '—'}
                                            value={ov !== undefined ? ov : ''}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '') {
                                                    // clear override
                                                    setOverride(sc, undefined); // hook should handle clear, actually wait
                                                    // Wait, my setOverride function doesn't clear if undefined, but if value is '', let's set it to 0 or we can make a clear handler.
                                                    // But for inline, if they clear it we should remove override.
                                                    // I will pass an empty string, let's fix it here:
                                                    if (e.target.value === '') { /* remove override */ }
                                                }
                                                // Easy workaround:
                                                setOverride(sc, v === '' ? undefined : parseInt(v));
                                            }}
                                            style={{width:'50px'}}
                                        />
                                    </td>
                                    
                                    {!isHidden('trend') && <td>{trendCell(r)}</td>}
                                    {!isHidden('cost') && <td>{r.cost > 0 ? r.cost.toFixed(2) : '—'}</td>}
                                    {!isHidden('oval') && <td><span style={{fontWeight:600}}>{r.oval > 0 ? r.oval.toLocaleString() : '—'}</span></td>}

                                    {!isHidden('reason') && <td className="c-reason" style={{fontSize:'11px',color:'var(--t2)'}}>{r.reason}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '15px', padding: '10px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} entries
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="ibtn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>« First</button>
                    <button className="ibtn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹ Prev</button>
                    <span style={{ padding: '4px 12px', fontSize: '14px', fontWeight: 500 }}>Page {currentPage} of {totalPages}</span>
                    <button className="ibtn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next ›</button>
                    <button className="ibtn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Last »</button>
                </div>
            </div>
            
            <div style={{marginTop: '20px'}}>
                <em>Note: Notes are deferred to the bulk action bar or are missing column in React just to simplify the demo.</em>
            </div>
        </div>
    );
}
