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

## 🛠️ Architecture
* **Cloudflare Workers:** Serverless edge computing.
* **Cloudflare D1:** SQL database for immutable timestamping and historical records.
* **Cloudflare Browser Rendering API:** Bypasses anti-bot firewalls (like Akamai) without manual intervention.
* **Chart.js:** Visualizes the yield curve and T-Bill/Sukuk spreads.

## 🔌 API Access
Researchers can access the raw JSON data directly. No authentication is required.

```http
GET https://gmdm.jalowbm.com/api/v1/auctions/latest
