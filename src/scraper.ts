import { Env } from './types';

export async function runScraper(env: Env) {
  console.log("Starting automated GMDM scrape...");

  const targetUrl = "https://www.cbg.gm/auction-results"; 
  
  try {
    console.log("Calling Cloudflare Browser Rendering API...");
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-rendering/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: targetUrl,
        gotoOptions: { waitUntil: 'networkidle0' },
        addScriptTag: [{
          content: `
            setTimeout(() => {
              const tabs = Array.from(document.querySelectorAll('button, a, div, span'));
              const tableTab = tabs.find(el => el.textContent?.trim() === 'Table');
              if (tableTab) tableTab.click();
            }, 2000);
          `
        }],
        waitForSelector: { selector: 'table', timeout: 15000 },
        waitForTimeout: 5000
      })
    });

    if (!response.ok) {
      console.log(`API Error: ${response.status} - ${await response.text()}`);
      return;
    }

    const jsonResponse: any = await response.json();
    const html = jsonResponse.result; 

    if (!html) {
      console.log("No HTML returned in the result field.");
      return;
    }

    console.log(`Successfully extracted HTML. Length: ${html.length} bytes`);
    
    // 1. Get the Date
    const dateMatch = html.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}/i);
    let parsedDate = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      const cleanDate = dateMatch[0].replace(/(\d+)(st|nd|rd|th)/, '$1');
      const d = new Date(cleanDate);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString().split('T')[0];
    }
    console.log(`Parsed Date: ${parsedDate}`);

    // 2. Extract the Data using a custom Regex
    // This looks for: <th>91-Day T/Bills</th> ... skips amount cells ... grabs the first commented-out number (W.A Price), then the second (Yield)
    const rowRegex = /<th>(\d{2,3}-Day[^<]+)<\/th>[\s\S]*?<td>([\d,.]+)<\/td>\s*<td>([\d,.]+)<\/td>\s*<td>([\d,.]+)<\/td>\s*<td>([\d,.-]+)<\/td>[\s\S]*?<!--\s*<td>([\d,.]+)<\/td>\s*<td>([\d,.]+)<\/td>/gi;
    
    const extractedData = [];
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const profile = match[1].trim();       // e.g., "91-Day T/Bills"
      const amountFloated = match[2];        // e.g., "5,000,000"
      const amountApplied = match[3];        // e.g., "8,150,000"
      const amountAccepted = match[4];       // e.g., "5,000,000"
      const yieldRate = parseFloat(match[7]); // e.g., "3.6400" (The Yield P.A %)

      const tenorMatch = profile.match(/(\d+)-Day/);
      if (tenorMatch) {
        const tenor = parseInt(tenorMatch[1]);
        const isSukuk = profile.includes('(SS)');
        
        extractedData.push({
          auction_date: parsedDate,
          security_type: isSukuk ? 'Sukuk' : 'T-Bill',
          tenor_days: tenor,
          yield_rate: yieldRate,
          amount_accepted: parseFloat(amountAccepted.replace(/,/g, ''))
        });
      }
    }

    console.log(`Extracted ${extractedData.length} records.`, JSON.stringify(extractedData, null, 2));

    // 3. Save to D1
    if (extractedData.length > 0) {
      for (const row of extractedData) {
        await env.GMDM_DB.prepare(
          `INSERT OR IGNORE INTO auctions 
          (auction_date, security_type, tenor_days, yield_rate, amount_accepted, source_url, validated_date) 
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          row.auction_date, 
          row.security_type, 
          row.tenor_days, 
          row.yield_rate, 
          row.amount_accepted, 
          targetUrl
        ).run();
      }
      console.log("✅ Successfully saved to D1 Database.");
    } else {
      console.log("No data matched the Regex.");
    }

  } catch (error) {
    console.error("Scraper error:", error);
  }
}