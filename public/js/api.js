// api.js
async function fetchData() {
    try {
        const response = await fetch('/api/v1/auctions/latest');
        const result = await response.json();
        
        const statusEl = document.getElementById('status');
        if(statusEl) statusEl.innerText = "API Status: Online & Automated";
        
        const tbody = document.getElementById('data-body');
        if(!tbody) return;

        if(result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No data available yet.</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(row => `
            <tr>
                <td>${row.auction_date}</td>
                <td>${row.security_type}</td>
                <td>${row.tenor_days} days</td>
                <td>${row.yield_rate.toFixed(2)}%</td>
                <td>${new Date(row.validated_date).toLocaleString()}</td>
            </tr>
        `).join('');

        // Pass the data to the charting module
        if (typeof renderChart === 'function') {
            renderChart(result.data);
        }
                // Render the Liquidity Index
        if (typeof renderLiquidity === 'function') {
            renderLiquidity(result.data);
        }

    } catch (e) {
        const statusEl = document.getElementById('status');
        if(statusEl) statusEl.innerText = "Error connecting to API.";
    }
}

document.addEventListener('DOMContentLoaded', fetchData);