import React, { useState } from 'react';
import { parseFile } from '../utils/parser';

export default function FileUploader({ id, label, badge, description, type, onDataLoaded }) {
    const [status, setStatus] = useState('');
    const [ready, setReady] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('Reading…');
        try {
            const data = await parseFile(file);
            setStatus(`✓ ${data.length} products loaded`);
            setReady(true);
            onDataLoaded({ rows: data, label: type });
        } catch (ex) {
            setStatus('Upload failed: ' + ex);
            setReady(false);
            onDataLoaded(null);
        }
    };

    const isPrev = id.startsWith('p');
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
            <div className="fst" id={`status-${id}`}>{status}</div>
        </div>
    );
}
