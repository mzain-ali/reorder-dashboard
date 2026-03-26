export function gv(row, key) {
    const k = Object.keys(row).find(k => k.toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, ''));
    return k !== undefined && row[k] !== null ? row[k] : null;
}

export function cname(n) { return n ? String(n).replace(/^\[[^\]]+\]\s*/, '').trim() : '—'; }

export function ecode(n) {
    if (!n) return '—';
    const m = String(n).match(/^\[([^\]]+)\]/);
    return m ? m[1] : String(n).substring(0, 30);
}

export function calcMonths(startDate, endDate) {
    const s = new Date(startDate), e = new Date(endDate);
    if (!startDate || !endDate || isNaN(s) || isNaN(e)) return 1;
    return Math.max(0.1, Math.round(((e - s) / 86400000 / 30.44) * 100) / 100);
}

export function calc(rows, lbl, months, p) {
    const { lt, buf, max, xm, moq, zt } = p;
    return rows.map(row => {
        const raw = gv(row, 'Product Name') || '';
        const sales = parseFloat(gv(row, 'Sales')) || 0;
        const stock = parseFloat(gv(row, 'Current Stock')) || 0;
        const xyz = String(gv(row, 'XYZ Classification') || '—').trim().toUpperCase();
        const ms = months > 0 ? sales / months : 0;
        const xf = (lbl === 'fast' && xyz.includes('Z')) ? (xm || 1.5) : 1;
        const rp = (lt + buf * xf) * ms;
        const mq = max * ms;
        const es = Math.max(stock, 0);
        const raw_oq = Math.max(0, mq - es);
        const emoq = Math.max(1, Math.round(moq || 1));
        const oq = raw_oq > 0 ? Math.ceil(raw_oq / emoq) * emoq : 0;
        const days = ms > 0 ? Math.round((es / ms) * 30.44) : null;
        let priority, reason;
        if (ms === 0) {
            if (stock < 0) { priority = 'urgent'; reason = 'Negative stock, no sales — review'; }
            else if (stock > (zt || 0)) { priority = 'ok'; reason = 'No sales in period — skip'; }
            else { priority = 'watch'; reason = 'Zero stock & zero sales — manual review'; }
        } else if (stock < 0) {
            priority = 'urgent'; reason = 'Negative stock';
        } else if (es < rp) {
            if (lbl === 'fast') { priority = 'order'; reason = 'Below reorder point — order now'; }
            else { priority = 'watch'; reason = 'Below safety buffer — review before ordering'; }
        } else {
            priority = 'ok'; reason = 'Sufficient stock';
        }
        const foq = priority === 'ok' ? 0 : oq;
        return {
            code: ecode(raw), name: cname(raw), fullName: String(raw),
            stock, ms: Math.round(ms * 10) / 10,
            rp: Math.round(rp), mq: Math.round(mq),
            oq: foq, days, priority, reason, label: lbl, xyz,
            xf: Math.round(xf * 10) / 10
        };
    });
}

export function buildPrevRates(prevFastData, prevSlowData, months) {
    const rates = {};
    const process = rows => rows.forEach(row => {
        const raw = gv(row, 'Product Name'); if (!raw) return;
        const code = ecode(raw);
        const sales = parseFloat(gv(row, 'Sales')) || 0;
        rates[code] = months > 0 ? sales / months : 0;
    });
    if (prevFastData?.rows) process(prevFastData.rows);
    if (prevSlowData?.rows) process(prevSlowData.rows);
    return rates;
}

export function enrichData(data, prevRates, defCost, overrides) {
    data.forEach(r => {
        const prev = prevRates[r.code];
        r.trend = (prev !== undefined && prev > 0)
            ? Math.round(((r.ms - prev) / prev) * 100)
            : (prev === 0 && r.ms > 0 ? 999 : null);
        r.cost = r._cost !== undefined ? r._cost : defCost;
        r.oval = r.oq > 0 ? Math.round(r.oq * r.cost * 100) / 100 : 0;
        if (overrides[r.code] !== undefined) {
            r.oval = Math.round(overrides[r.code] * r.cost * 100) / 100;
        }
    });
}
