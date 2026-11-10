// charts.js
let myChart = null;
let globalAuctionData = []; // Store the raw data here

function renderChart(data) {
    // If new data is passed, update the global cache
    if (data && data.length > 0) {
        globalAuctionData = data;
    }

    // If we have no data to render, exit
    if (globalAuctionData.length === 0) return;

    const latestDate = globalAuctionData[0].auction_date;
    const latestData = globalAuctionData.filter(d => d.auction_date === latestDate);

    const labels = ['91 Days', '182 Days', '364 Days'];
    const tbillData = [null, null, null];
    const sukukData = [null, null, null];

    latestData.forEach(row => {
        let index = -1;
        if (row.tenor_days === 91) index = 0;
        if (row.tenor_days === 182) index = 1;
        if (row.tenor_days === 364) index = 2;

        if (index !== -1) {
            if (row.security_type === 'T-Bill') tbillData[index] = row.yield_rate;
            if (row.security_type === 'Sukuk') sukukData[index] = row.yield_rate;
        }
    });

    const ctx = document.getElementById('yieldChart').getContext('2d');
    if (myChart) myChart.destroy();

    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text-main').trim();
    const gridColor = style.getPropertyValue('--border-color').trim();
    const accentColor = style.getPropertyValue('--accent-green').trim();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'T-Bill Yield (%)',
                    data: tbillData,
                    borderColor: accentColor,
                    backgroundColor: accentColor,
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 5
                },
                {
                    label: 'Sukuk Yield (%)',
                    data: sukukData,
                    borderColor: '#fbbf24',
                    backgroundColor: '#fbbf24',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { 
                    ticks: { color: textColor, callback: function(value) { return value + '%'; } },
                    grid: { color: gridColor },
                    beginAtZero: true
                }
            }
        }
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    
    // Re-render chart using the cached global data
    if (globalAuctionData.length > 0) {
        renderChart(); 
    }
}

// Set initial theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function renderLiquidity(data) {
    const container = document.getElementById('liquidity-container');
    if (!container) return;

    // Get the latest date
    const latestDate = data[0].auction_date;
    const latestData = data.filter(d => d.auction_date === latestDate);

    // Filter to only show T-Bills for simplicity (or you can do both)
    const tbills = latestData.filter(d => d.security_type === 'T-Bill').sort((a, b) => a.tenor_days - b.tenor_days);

    container.innerHTML = tbills.map(row => {
        // The Mathematics
        const ratio = (row.amount_applied / row.amount_floated) * 100;
        
        // Determine color based on ratio (Green if > 100%, Red if < 100%)
        const color = ratio >= 100 ? 'var(--accent-green)' : '#ef4444';

        return `
            <div style="flex: 1; min-width: 200px; background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">${row.tenor_days}-Day T-Bill</div>
                <div style="font-size: 2rem; font-weight: bold; color: ${color}; margin: 0.5rem 0;">
                    ${ratio.toFixed(1)}%
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">
                    Applied: D ${(row.amount_applied / 1000000).toFixed(1)}M<br>
                    Floated: D ${(row.amount_floated / 1000000).toFixed(1)}M
                </div>
            </div>
        `;
    }).join('');
}