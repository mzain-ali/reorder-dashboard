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
                    foundDates.sort((a, b) => a - b);
                    dateStart = foundDates[0].toISOString().split('T')[0];
                    dateEnd = foundDates[foundDates.length - 1].toISOString().split('T')[0];
                }

                const hdrs = rows[hi].map(h => h ? String(h).trim().toLowerCase() : '');
                const miss = ['product name', 'sales', 'current stock']
                    .filter(req => !hdrs.some(h => h.includes(req)));
                if (miss.length) throw new Error('Missing core columns: ' + miss.join(', '));

                const oh = rows[hi].map(h => h ? String(h).trim() : '');

                // Identify optional columns
                const fsnCol   = oh.find(h => h.toLowerCase().includes('fsn') || h.toLowerCase() === 'classification') || null;
                const costCol  = oh.find(h => h.toLowerCase() === 'cost' || h.toLowerCase() === 'unit cost') || null;
                const onOrderCol = oh.find(h => h.toLowerCase().includes('on order') || h.toLowerCase().includes('in transit')) || null;

                // Flags for data quality
                const _fsnMissing = !fsnCol;
                const _hasOnOrder = !!onOrderCol;

                let unknownFsnCount = 0;

                let recs = rows.slice(hi + 1)
                    .filter(r => r?.some(c => c !== null && c !== ''))
                    .map(r => {
                        const o = {};
                        oh.forEach((h, i) => { if (h) o[h] = r[i]; });

                        // FSN classification
                        let fsnStr = fsnCol ? String(o[fsnCol] || '').toLowerCase() : '';
                        if (fsnStr.includes('fast'))      o['_computedFsn'] = 'fast';
                        else if (fsnStr.includes('slow')) o['_computedFsn'] = 'slow';
                        else if (fsnStr.includes('non'))  o['_computedFsn'] = 'non';
                        else if (_fsnMissing)             o['_computedFsn'] = 'slow'; // no column at all → slow
                        else {
                            o['_computedFsn'] = 'slow'; // unrecognized value → slow
                            unknownFsnCount++;
                        }

                        // Per-product cost
                        if (costCol && o[costCol] !== null && o[costCol] !== undefined) {
                            const c = parseFloat(o[costCol]);
                            if (!isNaN(c)) o['_cost'] = c;
                        }

                        // On Order / In Transit
                        if (onOrderCol) {
                            const oo = parseFloat(o[onOrderCol]);
                            o['_onOrder'] = isNaN(oo) ? 0 : Math.max(0, oo);
                        }

                        return o;
                    })
                    .filter(r => r['Product Name']);

                // --- Deduplication by product name (merge Sales, take latest Stock) ---
                const seen = {};
                let duplicateCount = 0;
                recs.forEach(r => {
                    const key = String(r['Product Name']).trim();
                    if (seen[key]) {
                        // Merge: sum Sales, take max Current Stock (most conservative)
                        const prevSales = parseFloat(seen[key]['Sales']) || 0;
                        const thisSales = parseFloat(r['Sales']) || 0;
                        seen[key]['Sales'] = prevSales + thisSales;
                        // Keep the higher stock value (safer — prevents under-ordering)
                        const prevStock = parseFloat(seen[key]['Current Stock']) || 0;
                        const thisStock = parseFloat(r['Current Stock']) || 0;
                        seen[key]['Current Stock'] = Math.max(prevStock, thisStock);
                        duplicateCount++;
                    } else {
                        seen[key] = { ...r };
                    }
                });
                recs = Object.values(seen);

                // Build warnings array
                const warnings = [];
                if (_fsnMissing) {
                    warnings.push('FSN column not detected — all items defaulted to Slow-moving parameters.');
                } else if (unknownFsnCount > 0) {
                    warnings.push(`${unknownFsnCount} product${unknownFsnCount > 1 ? 's' : ''} had unrecognized FSN values — defaulted to Slow-moving.`);
                }
                if (duplicateCount > 0) {
                    warnings.push(`${duplicateCount} duplicate product${duplicateCount > 1 ? 's' : ''} found and merged (Sales summed, highest Stock kept).`);
                }
                if (_hasOnOrder) {
                    warnings.push('On Order / In Transit column detected — quantities netted against current stock to prevent double-ordering.');
                }

                ok({ rows: recs, dateStart, dateEnd, warnings, _fsnMissing, _hasOnOrder, _duplicateCount: duplicateCount });
            } catch (ex) {
                fail(ex.message);
            }
        };
        r.onerror = () => fail('File read error.');
        r.readAsArrayBuffer(file);
    });
}
