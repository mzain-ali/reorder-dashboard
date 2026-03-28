import React, { useEffect } from 'react';

export default function PODraft({ data, overrides, defCost }) {
    const items = data.filter(r => (r.priority === 'urgent' || r.priority === 'order') && (overrides[r.code] !== undefined ? overrides[r.code] : r.oq) > 0);

    // Feature 6: scoped print — add/remove body class to control what prints
    const handlePrintPO = () => {
        document.body.classList.add('print-po-only');
        window.print();
    };

    useEffect(() => {
        const cleanup = () => document.body.classList.remove('print-po-only');
        window.addEventListener('afterprint', cleanup);
        return () => window.removeEventListener('afterprint', cleanup);
    }, []);

    if (!items.length) {
        return <div className="po-empty">No items require ordering right now.</div>;
    }

    let total = 0;

    return (
        <div className="po-draft">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>
                    Purchase Order Draft — {new Date().toLocaleDateString()} <span style={{fontSize:'13px',fontWeight:400,color:'var(--t2)'}}>({items.length} products)</span>
                </h3>
                {/* Feature 6: PO-only print button */}
                <button className="ibtn" onClick={handlePrintPO} title="Print only the PO — hides the rest of the page">
                    🖨 Print PO
                </button>
            </div>

            <div className="po-row po-hdr">
                <span>Part No.</span><span>Product</span><span>Qty</span><span>Unit Cost</span><span>Value</span>
            </div>
            {items.map(r => {
                const oq = overrides[r.code] !== undefined ? overrides[r.code] : r.oq;
                const cost = r.cost || defCost;
                const val = Math.round(oq * cost * 100) / 100;
                total += val;
                return (
                    <div className="po-row" key={r.code}>
                        <span className="ct2">{r.code}</span>
                        <span style={{fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.fullName}>{r.name}</span>
                        <span>{oq}</span>
                        <span>{cost > 0 ? cost.toFixed(2) : '—'}</span>
                        <span style={{fontWeight:700}}>{val > 0 ? val.toLocaleString() : '—'}</span>
                    </div>
                );
            })}
            <div className="po-total">
                Total Order Value: <span>{total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</span>
            </div>

            {/* Feature 6: scoped print CSS */}
            <style>{`
                @media print {
                    body.print-po-only > *:not(.wrap) { display: none !important; }
                    body.print-po-only .wrap > *:not(#results) { display: none !important; }
                    body.print-po-only #results > *:not(#tab-po) { display: none !important; }
                    body.print-po-only #tab-po .tab-pane:not(#tab-po) { display: none !important; }
                    body.print-po-only .tabs { display: none !important; }
                    body.print-po-only .filter-bar { display: none !important; }
                }
            `}</style>
        </div>
    );
}
