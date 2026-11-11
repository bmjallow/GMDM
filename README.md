# Gambia Macro Debt Monitor (GMDM)

**An Open-Source Data Pipeline for Sovereign Debt Mathematics**

The Gambia Macro Debt Monitor (GMDM) is an automated, serverless data aggregation engine designed to monitor the yields, tenors, and accepted amounts of government securities issued by the Central Bank of The Gambia (CBG).

* **Author:** Bubacarr M Jallow
* **Role:** Independent Researcher, Theoretical Mathematics
* **Live Dashboard:** [gmdm.jalowbm.com](https://gmdm.jalowbm.com)
* **Whitepaper:** [gmdm.jalowbm.com/whitepaper.html](https://gmdm.jalowbm.com/whitepaper.html)

## 🎯 The Thesis
Access to sovereign debt data should be treated as a continuous, machine-readable function. The GMDM extracts raw numbers directly from the CBG's official website, timestamps them for validation, and visualizes the short-end yield curves.

**Zero Projections. Zero Estimations. Zero Hypotheses.** Every data point is a verifiable fact.

### The Mathematical Variables
The GMDM tracks the discrete mathematical operations of sovereign borrowing. Let the state of the system be defined by:
*   **T = Tenor** (Time in Days)
*   **Y = Yield** (Cost of Capital %)

To ensure absolute mathematical clarity, we separate the volume variables (in Dalasi):
*   **V<sub>f</sub> = Amount Floated** (The supply offered by the Central Bank)
*   **V<sub>a</sub> = Amount Applied** (The demand bid by the market)
*   **V<sub>t</sub> = Amount Accepted** (The actual transaction volume)

By distinguishing between V<sub>f</sub>, V<sub>a</sub>, and V<sub>t</sub>, researchers can calculate exact market behaviors. For instance, if V<sub>a</sub> exceeds V<sub>f</sub>, the market is oversubscribed. If V<sub>t</sub> is less than V<sub>f</sub>, the Central Bank has exercised a partial rejection.

## 🛠️ Architecture
* **Cloudflare Workers:** Serverless edge computing.
* **Cloudflare D1:** SQL database for immutable timestamping and historical records.
* **Cloudflare Browser Rendering API:** Bypasses anti-bot firewalls (like Akamai) without manual intervention.
* **Chart.js:** Visualizes the yield curve and T-Bill/Sukuk spreads.

## 🔌 API Access
Researchers can access the raw JSON data directly. No authentication is required.

```http
GET https://gmdm.jalowbm.com/api/v1/auctions/latest
