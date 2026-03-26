import React from 'react';

export default function Guide({ onBack }) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border)' }}>
            <button className="ibtn" onClick={onBack} style={{ marginBottom: '20px' }}>← Back to Dashboard</button>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginTop: 0, marginBottom: '8px' }}>Adaptive Reorder Dashboard</h1>
            <p className="subtitle" style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px' }}>Complete Business &amp; Operations Guide</p>

            <div className="card" style={{ background: 'var(--primary-bg)', padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
                <strong>Why we built this:</strong> 
                <p>Traditional inventory systems rely on fixed "Min/Max" numbers that constantly go out of date, leading to either stockouts (lost sales) or overstock (tied-up cash). This dashboard solves that by making reordering <strong>Adaptive</strong>. It looks at your actual recent sales history and calculates exactly what you need to order <em>right now</em>.</p>
            </div>

            <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-bg)' }}>1. How it Works (The Big Picture)</h2>
            <p>This tool analyzes Excel exports straight from Odoo. Instead of trusting hard-coded order points, it calculates exactly how fast every item is selling based on the date range you set.</p>
            <ul style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Step 1: Determine Run Rate.</strong> The tool counts the sales for the period and divides by the elapsed months to get a "Monthly Run Rate". <em>(e.g., sold 300 in 3 months = 100/month)</em></li>
                <li style={{ marginBottom: '8px' }}><strong>Step 2: Check Stock.</strong> Using your configured Lead Time and Buffer, it checks if your current stock will run out before a new shipment arrives.</li>
                <li style={{ marginBottom: '8px' }}><strong>Step 3: Suggest Order.</strong> If stock is low, it suggests an order quantity to build inventory back up to a "Max Stock" level, automatically rounding up based on Minimum Order Quantities (MOQ).</li>
            </ul>

            <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-bg)' }}>2. Key Terms &amp; Settings Explained</h2>
            <p>These are the sliders and inputs you can control on the main dashboard to adjust how aggressive or conservative the ordering logic is.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Term</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>What it means</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Business Impact</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>Lead Time (Months)</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>How long it takes a supplier to deliver an item once an order is placed.</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Higher lead times force the system to warn you earlier so you don't run out while waiting for cargo.</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safety Buffer</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Extra cushion inventory to cover unexpected sales spikes or shipping delays.</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Higher buffer = more cash tied up, but prevents out-of-stock situations. Lower buffer = leaner inventory.</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>Max Stock</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Your "target" inventory level when receiving a fresh shipment.</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>If set to 3 months, the system will order enough product so you have exactly 3 months' worth of supply when the shipment lands.</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>XYZ Multiplier</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>An extra safety boost applied to erratic or highly unpredictable items ("Z" items).</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Multiplies the safety buffer only for unpredictable items to prevent stockouts resulting from sudden spikes.</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>MOQ (Min. Order Qty)</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>The smallest batch size the factory/supplier allows.</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Ensures the final suggested order quantity is perfectly rounded to a supplier-acceptable number.</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>Run Rate</span></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>The average number of units sold per month based on the dates provided.</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>The core metric. If Run Rate is 0, the system stops ordering the item automatically.</td>
                    </tr>
                </tbody>
            </table>

            <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-bg)' }}>3. The Calculation Math (Under the Hood)</h2>
            <p>If you or an auditor need to verify exactly how the dashboard arrives at a number, here is the formula applied to every row:</p>
            
            <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', marginBottom: '24px' }}>
                1. Monthly Sales = Total Sales ÷ Elapsed Months<br/><br/>
                2. Reorder Point = (Lead Time + Safety Buffer) × Monthly Sales<br/><br/>
                3. Target Stock Ceiling = Max Stock × Monthly Sales<br/><br/>
                4. Raw Order Deficit = Target Stock Ceiling - Current Stock<br/><br/>
                5. Final Order Qty = Round up Deficit to nearest MOQ
            </div>

            <p><strong>Example:</strong> If a product sells 100 a month. Lead time is 1 month, safety buffer is 0.5 months. Max stock is 3 months. Current stock is 120.</p>
            <ul style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Reorder Point = (1 + 0.5) × 100 = <strong>150 units</strong></li>
                <li style={{ marginBottom: '8px' }}>Since Current Stock (120) is less than Reorder Point (150), it triggers an <strong>"Order Now"</strong> alert.</li>
                <li style={{ marginBottom: '8px' }}>Target Ceiling = 3 × 100 = 300. We have 120, so we need <strong>180</strong>.</li>
                <li style={{ marginBottom: '8px' }}>If MOQ is 50, it rounds 180 up to <strong>200 units</strong>.</li>
            </ul>

            <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-bg)' }}>4. The Priority Categories</h2>
            <p>The dashboard cuts through noise by sorting your data into actionable urgency buckets:</p>
            <ul style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Urgent:</span> Inventory is negative, or you literally have zero days left. Immediate action required.</li>
                <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Order Now:</span> Current stock has dropped below the Reorder Point. Cut a PO today.</li>
                <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Watch:</span> Only applies to slow-moving items. Stock has dropped completely out of buffer, but isn’t dead yet. Review before buying.</li>
                <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>OK:</span> You have plenty of stock to comfortably survive lead times. No action needed.</li>
            </ul>

            <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-bg)' }}>5. Advanced Dashboard Features</h2>
            
            <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Trend Detection (% Up / Down)</h3>
            <p>By uploading a "Previous Period" export alongside your current export, the dashboard maps the run-rates against each other. It instantly spots if an item's sales have dropped 50% or spiked 200%, helping you spot dying product lines or viral products before it's too late.</p>

            <h3 style={{ fontSize: '18px', marginTop: '24px' }}>What-If Simulator</h3>
            <p>As you slide parameters (e.g., dropping buffer from 1 month to 0.5 months), the math updates instantly across all items. A dynamic banner alerts you to the exact impact your policy change just had.</p>
            
            <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Data Quality Checker</h3>
            <p>Checks for duplicates, negative stock, missing names, and zero-sales items silently behind the scenes. Bad Excel data won't silently corrupt your reorder numbers.</p>
            
            <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Timeline &amp; PO Draft Tabs</h3>
            <p>Outputs are rendered in three ways: The absolute raw data (Table), grouped by days remaining (Timeline), and a clean Purchase Order layout ready to copy-paste into Odoo or an email.</p>
        </div>
    );
}
