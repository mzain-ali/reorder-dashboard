import * as XLSX from 'xlsx';

export function parseFile(file) {
    return new Promise((ok, fail) => {
        const r = new FileReader();
        r.onload = e => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
                
                let hi = -1;
                for (let i = 0; i < Math.min(rows.length, 20); i++) {
                    if (rows[i]?.some(c => c && String(c).toLowerCase().includes('product name'))) { hi = i; break; }
                }
                
                if (hi < 0) throw new Error('No "Product Name" header found in the first 20 rows.');
                
                // --- Auto Date Detection from Pre-Headers ---
                const dateRegex = /\b(\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2}|\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4})\b/g;
                let foundDates = [];
                for (let i = 0; i < hi; i++) {
                    const rowStr = (rows[i] || []).map(String).join(' ');
                    let m;
                    while ((m = dateRegex.exec(rowStr)) !== null) {
                        const d = new Date(m[1]);
                        if (!isNaN(d)) foundDates.push(d);
                    }
                }
                
                let dateStart = null;
                let dateEnd = null;
                if (foundDates.length > 0) {
                    foundDates.sort((a,b) => a - b);
                    // Odoo usually prints FROM and TO dates.
                    dateStart = foundDates[0].toISOString().split('T')[0];
                    dateEnd = foundDates[foundDates.length - 1].toISOString().split('T')[0];
                }
                
                const hdrs = rows[hi].map(h => h ? String(h).trim().toLowerCase() : '');
                const miss = ['product name', 'sales', 'current stock']
                    .filter(req => !hdrs.some(h => h.includes(req)));
                if (miss.length) throw new Error('Missing core columns: ' + miss.join(', '));
                
                const oh = rows[hi].map(h => h ? String(h).trim() : '');
                
                // Identify which column holds the FSN definition
                const fsnCol = oh.find(h => h.toLowerCase().includes('fsn') || h.toLowerCase() === 'classification') || null;

                const recs = rows.slice(hi + 1)
                    .filter(r => r?.some(c => c !== null && c !== ''))
                    .map(r => { 
                        const o = {}; 
                        oh.forEach((h, i) => { if (h) o[h] = r[i]; }); 
                        
                        // Infer FSN directly if available
                        let fsnStr = fsnCol ? String(o[fsnCol] || '').toLowerCase() : '';
                        
                        if (fsnStr.includes('fast')) o['_computedFsn'] = 'fast';
                        else if (fsnStr.includes('slow')) o['_computedFsn'] = 'slow';
                        else if (fsnStr.includes('non')) o['_computedFsn'] = 'non';
                        else o['_computedFsn'] = 'unknown'; // fallback

                        return o; 
                    })
                    .filter(r => r['Product Name']); // Valid rows must have a product name
                    
                ok({ rows: recs, dateStart, dateEnd });
            } catch (ex) {
                fail(ex.message);
            }
        };
        r.onerror = () => fail('File read error.');
        r.readAsArrayBuffer(file);
    });
}
