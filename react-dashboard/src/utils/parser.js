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
                if (hi < 0) throw new Error('No "Product Name" header found.');
                const hdrs = rows[hi].map(h => h ? String(h).trim().toLowerCase() : '');
                const miss = ['product name', 'sales', 'current stock', 'xyz classification']
                    .filter(req => !hdrs.some(h => h.includes(req)));
                if (miss.length) throw new Error('Missing columns: ' + miss.join(', '));
                const oh = rows[hi].map(h => h ? String(h).trim() : '');
                const recs = rows.slice(hi + 1)
                    .filter(r => r?.some(c => c !== null && c !== ''))
                    .map(r => { const o = {}; oh.forEach((h, i) => { if (h) o[h] = r[i]; }); return o; })
                    .filter(r => r['Product Name']);
                ok(recs);
            } catch (ex) {
                fail(ex.message);
            }
        };
        r.onerror = () => fail('File read error.');
        r.readAsArrayBuffer(file);
    });
}
