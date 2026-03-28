import React from 'react';

export default function DataWarnings({ warnings, onDismiss }) {
    if (!warnings || warnings.length === 0) return null;

    return (
        <div className="dw-strip">
            {warnings.map((msg, i) => (
                <div className="dw-row" key={i}>
                    <span className="dw-icon">⚠</span>
                    <span className="dw-msg">{msg}</span>
                    <button className="dw-close" onClick={() => onDismiss(i)} title="Dismiss">✕</button>
                </div>
            ))}
            <style>{`
                .dw-strip {
                    margin: 12px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .dw-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #FFFBEB;
                    border: 1px solid #F59E0B;
                    border-left: 4px solid #F59E0B;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 13px;
                    color: #92400E;
                }
                .dark .dw-row {
                    background: #1C1505;
                    border-color: #B45309;
                    color: #FCD34D;
                }
                .dw-icon { font-size: 15px; flex-shrink: 0; }
                .dw-msg  { flex: 1; line-height: 1.4; }
                .dw-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    color: #92400E;
                    opacity: 0.6;
                    padding: 0 2px;
                    flex-shrink: 0;
                }
                .dark .dw-close { color: #FCD34D; }
                .dw-close:hover { opacity: 1; }
            `}</style>
        </div>
    );
}
