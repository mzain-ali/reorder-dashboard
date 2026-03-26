import React, { useState } from 'react';

export default function ParametersPanel({ params, updateParam, calcMonths }) {
    
    const DateInput = ({ id, label }) => (
        <div className="pb">
            <label>{label}</label>
            <input 
                type="date" 
                value={params[id]}
                onChange={e => updateParam(id, e.target.value)}
            />
        </div>
    );

    const NumberInput = ({ id, label, min = 0, max, step = 1 }) => (
        <div className="pb">
            <label>{label}</label>
            <input 
                type="number" 
                value={params[id]}
                min={min} max={max} step={step}
                onChange={e => updateParam(id, e.target.value)}
            />
        </div>
    );

    return (
        <>
            <hr className="dvd" />
            
            <p className="sl">Report Period</p>
            <div className="pg" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <DateInput id="date-start" label="Start Date" />
                <DateInput id="date-end" label="End Date" />
                <div className="pb">
                    <label>Calculated Months</label>
                    <input 
                        type="text" 
                        value={calcMonths(params['date-start'], params['date-end'])} 
                        readOnly 
                        style={{ background: 'var(--bg2)', color: 'var(--t2)' }} 
                    />
                </div>
            </div>

            <p className="sl">Fast Moving Parameters</p>
            <div className="pg">
                <NumberInput id="lt-fast" label="Lead time (mo)" min="0.1" max="6" step="0.1" />
                <NumberInput id="buf-fast" label="Safety buffer (mo)" min="0.1" max="3" step="0.1" />
                <NumberInput id="max-fast" label="Max stock (mo)" min="1" max="12" step="0.5" />
                <NumberInput id="xyz-mult" label="XYZ mult (Z items)" min="1" max="3" step="0.1" />
                <NumberInput id="moq-fast" label="Min Order Qty (MOQ)" min="1" />
                <NumberInput id="zt-fast" label="Zero-sales threshold" />
            </div>

            <p className="sl">Slow Moving Parameters</p>
            <div className="pg">
                <NumberInput id="lt-slow" label="Lead time (mo)" min="0.1" max="6" step="0.1" />
                <NumberInput id="buf-slow" label="Safety buffer (mo)" min="0.1" max="6" step="0.1" />
                <NumberInput id="max-slow" label="Max stock (mo)" min="1" max="12" step="0.5" />
                <NumberInput id="moq-slow" label="Min Order Qty (MOQ)" min="1" />
                <NumberInput id="zt-slow" label="Zero-sales threshold" />
            </div>

            <div className="cost-row">
                <label>Default Unit Cost</label>
                <input 
                    type="number" 
                    value={params['default-cost'] || 0} 
                    min="0" step="0.01" placeholder="0.00"
                    onChange={e => updateParam('default-cost', e.target.value)}
                />
                <span className="cost-note">
                    Leave 0 to skip cost calculations. If your export has a "Cost" column, it will be used automatically per product.
                </span>
            </div>
        </>
    );
}
