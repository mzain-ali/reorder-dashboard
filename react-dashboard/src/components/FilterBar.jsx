import React from 'react';

export default function FilterBar({ filters, toggleFilter }) {
    const activeClass = "bg-accent text-white border-accent shadow-[0_2px_6px_rgba(79,70,229,0.3)] dark:bg-accent-dark dark:border-accent-dark";
    
    // Priority specific active colors
    const activeUrg = "bg-red-600 text-white border-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.3)] dark:bg-red-700 dark:border-red-700";
    const activeOrd = "bg-amber-600 text-white border-amber-600 shadow-[0_2px_6px_rgba(217,119,6,0.3)] dark:bg-amber-700 dark:border-amber-700";
    const activeWat = "bg-blue-600 text-white border-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.3)] dark:bg-blue-700 dark:border-blue-700";
    const activeOk = "bg-emerald-600 text-white border-emerald-600 shadow-[0_2px_6px_rgba(5,150,105,0.3)] dark:bg-emerald-700 dark:border-emerald-700";
    const activeStar = "bg-amber-500 text-white border-amber-500 shadow-[0_2px_6px_rgba(245,158,11,0.3)] dark:bg-amber-600 dark:border-amber-600";

    const baseBtn = "bg-white border border-slate-300 rounded-full px-3.5 py-1 text-xs font-semibold cursor-pointer text-slate-600 transition-all hover:border-accent hover:text-accent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-accent-dark dark:hover:text-accent-dark";

    const hasPriority = (p) => filters.priority?.has(p);
    const hasClass = (c) => filters.class?.has(c);
    const hasCustom = (c) => filters.custom?.has(c);

    return (
        <div className="flex flex-wrap gap-4 mb-5 px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl dark:bg-slate-800/80 dark:border-slate-700">
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-1.5 dark:text-slate-400">Priority Filter</span>
                <button className={`${baseBtn} ${hasPriority('urgent') ? activeUrg : ''}`} onClick={() => toggleFilter('priority', 'urgent')}>🔴 Urgent</button>
                <button className={`${baseBtn} ${hasPriority('order') ? activeOrd : ''}`} onClick={() => toggleFilter('priority', 'order')}>🟡 Order Now</button>
                <button className={`${baseBtn} ${hasPriority('watch') ? activeWat : ''}`} onClick={() => toggleFilter('priority', 'watch')}>🔵 Watch</button>
                <button className={`${baseBtn} ${hasPriority('ok') ? activeOk : ''}`} onClick={() => toggleFilter('priority', 'ok')}>🟢 OK</button>
            </div>

            <div className="w-[1px] bg-slate-300 h-6 mx-2 hidden sm:block dark:bg-slate-600"></div>

            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-1.5 dark:text-slate-400">XYZ Class</span>
                <button className={`${baseBtn} ${hasClass('X') ? activeClass : ''}`} onClick={() => toggleFilter('class', 'X')}>X (Consistent)</button>
                <button className={`${baseBtn} ${hasClass('Y') ? activeClass : ''}`} onClick={() => toggleFilter('class', 'Y')}>Y (Variable)</button>
                <button className={`${baseBtn} ${hasClass('Z') ? activeClass : ''}`} onClick={() => toggleFilter('class', 'Z')}>Z (Sporadic)</button>
            </div>

            <div className="w-[1px] bg-slate-300 h-6 mx-2 hidden lg:block dark:bg-slate-600"></div>

            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-1.5 dark:text-slate-400">Custom</span>
                <button className={`${baseBtn} ${hasCustom('starred') ? activeStar : ''}`} onClick={() => toggleFilter('custom', 'starred')}>★ Flagged Only</button>
            </div>
        </div>
    );
}
