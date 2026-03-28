import React, { useMemo } from 'react';

export default function TimelineView({ data, overrides }) {
    const cols = useMemo(() => {
        const _urg = [], _ord = [], _wat = [];
        data.forEach(r => {
            if (r.priority === 'urgent') _urg.push(r);
            else if (r.priority === 'order') _ord.push(r);
            else if (r.priority === 'watch') _wat.push(r);
        });
        return { urg: _urg, ord: _ord, wat: _wat };
    }, [data]);

    const Card = ({ r }) => {
        const qty = overrides[r.code] !== undefined ? overrides[r.code] : r.oq;
        const colorClass = r.priority === 'urgent' ? 'border-red-500 bg-white dark:bg-slate-800'  :
                           r.priority === 'order'  ? 'border-amber-500 bg-white dark:bg-slate-800' :
                                                     'border-blue-500 bg-white dark:bg-slate-800';

        return (
            <div className={`border-l-4 rounded-lg p-3.5 shadow-sm text-[13px] transition-all hover:translate-x-1 hover:shadow-md ${colorClass} group cursor-default`}>
                <div className="flex justify-between items-start mb-2">
                    <strong className="font-bold text-slate-900 dark:text-slate-100">{r.code}</strong>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {r.days !== null ? `${r.days}d left` : 'N/A'}
                    </span>
                </div>
                <div className="text-slate-600 mb-3 line-clamp-2 leading-snug dark:text-slate-400" title={r.fullName}>{r.name}</div>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 dark:text-slate-400">
                    <span>Stock: {r.stock}</span>
                    <strong className={`font-bold px-1.5 py-0.5 rounded ${qty > 0 ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : ''}`}>Order: {qty}</strong>
                </div>
            </div>
        );
    };

    return (
        <div className="flex gap-5 overflow-x-auto pb-5 mb-5 select-none">
            <div className="flex-1 min-w-[280px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 dark:bg-slate-800/40 dark:border-slate-700">
                <div className="font-bold text-[13px] text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-200 mb-1 flex justify-between items-center dark:text-slate-400 dark:border-slate-700">
                    <span>🔴 Urgent</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] dark:bg-slate-700 dark:text-slate-300">{cols.urg.length}</span>
                </div>
                {cols.urg.map(r => <Card key={r.code} r={r} />)}
            </div>
            
            <div className="flex-1 min-w-[280px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 dark:bg-slate-800/40 dark:border-slate-700">
                <div className="font-bold text-[13px] text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-200 mb-1 flex justify-between items-center dark:text-slate-400 dark:border-slate-700">
                    <span>🟡 Order Now</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] dark:bg-slate-700 dark:text-slate-300">{cols.ord.length}</span>
                </div>
                {cols.ord.map(r => <Card key={r.code} r={r} />)}
            </div>
            
            <div className="flex-1 min-w-[280px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 dark:bg-slate-800/40 dark:border-slate-700">
                <div className="font-bold text-[13px] text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-200 mb-1 flex justify-between items-center dark:text-slate-400 dark:border-slate-700">
                    <span>🔵 Watch</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] dark:bg-slate-700 dark:text-slate-300">{cols.wat.length}</span>
                </div>
                {cols.wat.map(r => <Card key={r.code} r={r} />)}
            </div>
        </div>
    );
}
