import React, { useState } from 'react';
import { parseFile } from '../utils/parser';

export default function FileUploader({ id, label, badge, description, type, onDataLoaded }) {
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState(''); // 'ok' | 'warn' | 'error' | ''
    const [ready, setReady] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('Reading…');
        setStatusType('');
        try {
            const data = await parseFile(file);
            const warnings = [];

            // Bug 3 fix: surface FSN-missing and duplicate count directly in the uploader card
            if (data._fsnMissing) {
                warnings.push('FSN column not detected — defaulted to Slow.');
            }
            if (data._duplicateCount > 0) {
                warnings.push(`${data._duplicateCount} duplicate${data._duplicateCount > 1 ? 's' : ''} merged.`);
            }
            if (data._hasOnOrder) {
                warnings.push('On Order column detected & applied.');
            }

            if (warnings.length > 0) {
                setStatus(`✓ ${data.rows.length} products loaded  ⚠ ${warnings.join('  ⚠ ')}`);
                setStatusType('warn');
            } else {
                setStatus(`✓ ${data.rows.length} products loaded`);
                setStatusType('ok');
            }

            setReady(true);
            onDataLoaded(data);
        } catch (ex) {
            setStatus('Upload failed: ' + ex);
            setStatusType('error');
            setReady(false);
            onDataLoaded(null);
        }
    };

    const statusColor = statusType === 'ok' ? 'var(--success, #10B981)' :
                        statusType === 'warn' ? '#D97706' :
                        statusType === 'error' ? 'var(--danger, #EF4444)' : 'var(--t2)';

    const badgeClass = type === 'fast' ? 'badge-fast' : 'badge-slow';

    return (
        <div className={`up-card ${ready ? 'ready' : ''}`} id={`card-${id}`}>
            <span className={`badge ${badgeClass}`}>{badge}</span>
            <p className="ct">{label}</p>
            <p className="cs">{description}</p>
            <label className="fl" htmlFor={`file-${id}`}>Choose .xlsx or .csv file</label>
            <input
                type="file"
                id={`file-${id}`}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFile}
            />
            <div className="fst" id={`status-${id}`} style={{ color: statusColor, fontWeight: statusType ? 500 : 'normal' }}>
                {status}
            </div>
        </div>
    );
}
