import React from 'react';

export default function TimelineView({ data, overrides }) {
    const buckets = [
        { label: '🔴 This Week (≤7 days)', bg: '#FEF2F2', fn: r => r.days !== null && r.days <= 7 || r.priority === 'urgent' },
        { label: '🟡 Next 2 Weeks (8–14d)', bg: '#FFFBEB', fn: r => r.days !== null && r.days > 7 && r.days <= 14 && r.priority !== 'urgent' },
        { label: '🟠 This Month (15–30d)', bg: '#FFF7ED', fn: r => r.days !== null && r.days > 14 && r.days <= 30 },
        { label: '🟢 Next Month (31–60d)', bg: '#F0FDF4', fn: r => r.days !== null && r.days > 30 && r.days <= 60 },
        { label: '✅ 60+ Days / OK', bg: '#F9FAFB', fn: r => r.days === null || r.days > 60 },
    ];

    return (
        <div>
            {buckets.map(b => {
                const items = data.filter(b.fn);
                if (!items.length) return null;
                return (
                    <div className="tl-group" key={b.label}>
                        <div className="tl-head" style={{background: b.bg}}>
                            {b.label} <span style={{fontWeight:400,fontSize:'12px'}}>({items.length} items)</span>
                        </div>
                        {items.map(r => {
                            const oq = overrides[r.code] !== undefined ? overrides[r.code] : r.oq;
                            return (
                                <div className="tl-item" key={r.code}>
                                    <span className="tl-days">{r.days !== null ? r.days + 'd left' : 'N/A'}</span>
                                    <span className="tl-name" title={r.fullName}>{r.name}</span>
                                    <span className="ct2">{r.code}</span>
                                    <span className="tl-qty">{oq > 0 ? 'Order ' + oq : ''}</span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
