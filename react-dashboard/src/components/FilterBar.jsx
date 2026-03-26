import React from 'react';

export default function FilterBar({ filters, toggleFilter }) {
    const isAct = (key, val) => filters[key]?.has(val);

    const toggle = (key, val) => toggleFilter(key, val);

    const pt = (label, key, val, colorClass) => (
        <button 
            className={`tag-btn ${isAct(key, val) ? 'on' : ''} ${colorClass || ''}`}
            onClick={() => toggle(key, val)}
        >
            {label}
        </button>
    );

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <span className="fg-label">Action Status:</span>
                {pt('Urgent', 'priority', 'urgent', 't-urg')}
                {pt('Order Now', 'priority', 'order', 't-ord')}
                {pt('Watch', 'priority', 'watch', 't-wat')}
                {pt('OK', 'priority', 'ok', 't-ok')}
            </div>

            <div className="filter-group">
                <span className="fg-label">Class:</span>
                {pt('Class X', 'class', 'X')}
                {pt('Class Y', 'class', 'Y')}
                {pt('Class Z', 'class', 'Z')}
            </div>

            <div className="filter-group">
                <span className="fg-label">Custom:</span>
                {pt('★ Starred', 'custom', 'starred', 't-star')}
            </div>
            
            <style>{`
                .filter-bar { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; padding: 15px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
                .filter-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .fg-label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
                .tag-btn { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 4px 12px; font-size: 13px; cursor: pointer; color: var(--text-main); transition: all 0.2s; }
                .tag-btn:hover { border-color: var(--primary); }
                .tag-btn.on { background: var(--primary); color: white; border-color: var(--primary); }
                
                .tag-btn.t-urg.on { background: #DC2626; border-color: #DC2626; }
                .tag-btn.t-ord.on { background: #D97706; border-color: #D97706; }
                .tag-btn.t-wat.on { background: #2563EB; border-color: #2563EB; }
                .tag-btn.t-ok.on { background: #059669; border-color: #059669; }
                .tag-btn.t-star.on { background: #F59E0B; border-color: #F59E0B; color: #000; }
            `}</style>
        </div>
    );
}
