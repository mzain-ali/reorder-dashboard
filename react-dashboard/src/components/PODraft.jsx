import React from 'react';

export default function PODraft({ data, overrides, defCost }) {
    const items = data.filter(r => (r.priority === 'urgent' || r.priority === 'order') && (overrides[r.code] !== undefined ? overrides[r.code] : r.oq) > 0);
    
    if (!items.length) {
        return <div className="po-empty">No items require ordering right now.</div>;
    }

    let total = 0;
    
    return (
        <div className="po-draft">
            <h3>Purchase Order Draft — {new Date().toLocaleDateString()} <span style={{fontSize:'13px',fontWeight:400,color:'var(--t2)'}}>({items.length} products)</span></h3>
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
        </div>
    );
}
