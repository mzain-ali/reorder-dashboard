import React from 'react';

export default function Guide({ onBack }) {
    return (
        <div className="max-w-[800px] bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-slate-200 mx-auto mt-4 dark:bg-slate-800 dark:border-slate-700">
            <button className="flex items-center gap-1.5 bg-transparent border-none text-[15px] cursor-pointer text-slate-500 font-bold mb-6 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-100" onClick={onBack}>
                <span className="text-xl leading-none -mt-px">‹</span> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 dark:text-slate-100">📖 Adaptive Reorder Guide</h2>
            <div className="w-12 h-1 bg-accent rounded-full mb-8 dark:bg-accent-dark"></div>

            <div className="mb-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="mb-4">This tool analyzes your Odoo FSN classifications and actual sales run-rates to generate dynamic reorder recommendations. It replaces static min/max rules with logic that adapts to current demand trends.</p>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-[13px] text-amber-900 my-5 shadow-sm dark:bg-[#2D1D00] dark:border-amber-600 dark:text-amber-200">
                    <strong>Critical Note on Data Quality:</strong> This tool relies on the <code>FSN Class</code> and <code>XYZ Class</code> fields in your Odoo export. Products missing FSN classifications will default to <em>Slow Moving</em> to prevent over-ordering. Duplicates in the export are automatically merged (quantities summed).
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4 dark:text-slate-100 border-b border-slate-200 pb-2 dark:border-slate-700">1. How Calculations Work</h3>
            <div className="mb-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="mb-4">Calculations branch into two distinct paths based on the item's FSN class:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                        <strong className="text-accent dark:text-accent-dark text-[15px] block mb-2">Fast Moving (F)</strong>
                        <p className="text-[13px] mb-2 leading-relaxed">High volume, predictable demand.</p>
                        <ul className="text-[13px] space-y-1.5 pl-4 list-disc text-slate-600 dark:text-slate-400">
                            <li><strong>Run Rate:</strong> Average hits/month</li>
                            <li><strong>Reorder Point:</strong> Run Rate × (Lead Time + Buffer)</li>
                            <li><strong>Order Qty:</strong> (Max Months × Run Rate) - Stock - On Order</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                        <strong className="text-blue-600 dark:text-blue-400 text-[15px] block mb-2">Slow/Non-Moving (S, N)</strong>
                        <p className="text-[13px] mb-2 leading-relaxed">Low volume, sporadic demand.</p>
                        <ul className="text-[13px] space-y-1.5 pl-4 list-disc text-slate-600 dark:text-slate-400">
                            <li><strong>Run Rate:</strong> Absolute max hits in any single month</li>
                            <li><strong>Reorder Point:</strong> Absolute Max × (Lead Time + Buffer)</li>
                            <li><strong>Order Qty:</strong> (Max Months × Absolute Max) - Stock - On Order</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4 dark:text-slate-100 border-b border-slate-200 pb-2 dark:border-slate-700">2. Priority Buckets</h3>
            <div className="mb-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                <ul className="space-y-4 list-none m-0 p-0 mt-4">
                    <li className="flex items-start gap-3"><span className="text-xl leading-none">🔴</span><div><strong>Urgent:</strong> Stock ≤ 0 and active demand. Requires immediate air-freight or expedited ordering.</div></li>
                    <li className="flex items-start gap-3"><span className="text-xl leading-none">🟡</span><div><strong>Order Now:</strong> Stock + On Order is strictly below the calculated Reorder Point.</div></li>
                    <li className="flex items-start gap-3"><span className="text-xl leading-none">🔵</span><div><strong>Watch:</strong> Stock + On Order is exactly at or barely above the Reorder Point. Next month's sales will likely trigger an order.</div></li>
                    <li className="flex items-start gap-3"><span className="text-xl leading-none">🟢</span><div><strong>OK:</strong> Healthy stock levels. No action required.</div></li>
                </ul>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4 dark:text-slate-100 border-b border-slate-200 pb-2 dark:border-slate-700">3. Trend Detection (Advanced)</h3>
            <div className="mb-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="mb-4">Trend detection requires uploading a <strong>Previous Period</strong> export alongside the Current Period export.</p>
                <ul className="text-sm space-y-2 pl-4 list-disc text-slate-600 dark:text-slate-400 mb-6">
                    <li><strong className="text-slate-900 dark:text-slate-200">New Products:</strong> Items present in Current but missing in Previous drop entirely into a "New ↑" status to highlight sudden demand spikes.</li>
                    <li><strong className="text-slate-900 dark:text-slate-200">Rising Trends (↑ X%):</strong> Triggers an alert if a Slow-moving item suddenly jumps by &gt;20% in volume, suggesting it may need reclassification to Fast-moving.</li>
                    <li><strong className="text-slate-900 dark:text-slate-200">Falling Trends (↓ X%):</strong> Useful for identifying high inventory levels that will age out if demand continues to drop.</li>
                </ul>
            </div>
        </div>
    );
}
