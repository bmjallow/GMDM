import { Env } from './types';

export async function handleApiRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);

  // Endpoint 1: Fetch data for the frontend
  if (url.pathname === '/api/v1/auctions/latest' && request.method === 'GET') {
    try {
      const { results } = await env.GMDM_DB.prepare(
        "SELECT * FROM auctions ORDER BY auction_date DESC LIMIT 10"
      ).all();

      return new Response(JSON.stringify({
        status: "success",
        meta: { source: "Central Bank of The Gambia", extracted_at: new Date().toISOString() },
        data: results
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }
  }

  // Endpoint 2: Accept raw pasted text, parse it, and save to DB
  if (url.pathname === '/api/v1/ingest' && request.method === 'POST') {
    try {
      const body: any = await request.json();
      const rawText = body.raw_text; 

      if (!rawText) {
        return new Response(JSON.stringify({ error: "No text provided" }), { status: 400 });
      }

      // --- PARSING LOGIC ---
      // This regex looks for dates in the text (e.g., November 4th, 2026)
      const dateMatch = rawText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}/i);
      const auctionDate = dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // For this example, we will extract the yields based on common text patterns.
      // (You will need to tweak these regexes based on exactly how you copy the text).
      // Let's assume a simple placeholder extraction for now to prove the pipeline works.
      
      const extractedData = [
        { tenor: 91, type: 'T-Bill', yield: 3.77, accepted: 5000000 },
        { tenor: 182, type: 'T-Bill', yield: 6.95, accepted: 29250000 },
        { tenor: 364, type: 'T-Bill', yield: 12.70, accepted: 550000000 }
      ];

      // Insert into D1
      for (const row of extractedData) {
        await env.GMDM_DB.prepare(
          `INSERT OR IGNORE INTO auctions 
          (auction_date, security_type, tenor_days, yield_rate, amount_accepted, source_url, validated_date) 
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(auctionDate, row.type, row.tenor, row.yield, row.accepted, 'manual-ingest').run();
      }

      return new Response(JSON.stringify({ status: "success", message: "Data ingested", date: auctionDate }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Ingestion failed" }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404 });
}