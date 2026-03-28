import React from 'react';

export default function PODraft({ data, overrides, defCost }) {
    const toOrder = data.filter(r => (overrides[r.code] !== undefined ? overrides[r.code] : r.oq) > 0);

    const handlePrintPO = () => {
        document.body.classList.add('print-po-only');
        window.print();
        const cleanup = () => {
            document.body.classList.remove('print-po-only');
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
    };

    if (toOrder.length === 0) return (
        <div className="py-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
            <span className="text-4xl mb-3 opacity-50">📄</span>
            <p className="font-medium text-[15px]">No items require ordering based on current parameters.</p>
        </div>
    );

    let gTotal = 0;
    const today = new Date().toISOString().slice(0,10);

    return (
        <div>
            <div className="flex gap-3 mb-6 no-print">
                <button 
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold px-5 py-2.5 rounded-lg border-none bg-accent text-white cursor-pointer transition-all shadow-sm hover:bg-accent-h hover:-translate-y-px hover:shadow-md dark:bg-accent-dark dark:hover:bg-accent-h-dark"
                    onClick={handlePrintPO}
                >
                    🖨 Print PO Draft
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Purchase Order Draft</h2>
            <div className="flex flex-col gap-1.5 text-[13px] text-slate-600 mb-6 max-w-[300px] border border-slate-200 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 print-avoid-break">
                <strong>Date:</strong> {today}<br/>
                <strong>Items:</strong> {toOrder.length}
            </div>

            <div className="overflow-x-auto print-avoid-break bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full border-collapse text-[13px] text-left">
                    <thead>
                        <tr>
                            <th className="font-bold text-[11px] text-slate-500 px-4 py-3 border-b border-slate-200 bg-slate-50 uppercase tracking-widest dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700">Part No.</th>
                            <th className="font-bold text-[11px] text-slate-500 px-4 py-3 border-b border-slate-200 bg-slate-50 uppercase tracking-widest dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 w-1/2">Product Description</th>
                            <th className="font-bold text-[11px] text-slate-500 px-4 py-3 border-b border-slate-200 bg-slate-50 uppercase tracking-widest dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 text-right">Qty</th>
                            <th className="font-bold text-[11px] text-slate-500 px-4 py-3 border-b border-slate-200 bg-slate-50 uppercase tracking-widest dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 text-right">Unit Cost</th>
                            <th className="font-bold text-[11px] text-slate-500 px-4 py-3 border-b border-slate-200 bg-slate-50 uppercase tracking-widest dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {toOrder.map(r => {
                            const q = overrides[r.code] !== undefined ? overrides[r.code] : r.oq;
                            const c = r.cost > 0 ? r.cost : defCost;
                            const t = q * c;
                            gTotal += t;
                            return (
                                <tr key={r.code} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                    <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-100 dark:text-slate-100 dark:border-slate-800">{r.code}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.name}</td>
                                    <td className="px-4 py-3 font-bold text-accent text-right dark:text-accent-dark">{q}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">{c > 0 ? c.toFixed(2) : '-'}</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">{t > 0 ? t.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2}) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                        <tr>
                            <td colSpan="4" className="px-4 py-3 text-right font-bold text-slate-900 text-sm dark:text-slate-100">Estimated PO Total:</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm tabular-nums dark:text-slate-100">{gTotal.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
