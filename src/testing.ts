import { Env } from './types';
import { runScraper } from './scraper';

export async function handleTestingRoutes(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  // TEMPORARY ROUTE FOR MANUAL TESTING
  if (url.pathname === '/run-now') {
    console.log("Manual trigger hit /run-now. Executing scraper...");
    await runScraper(env); 
    return new Response("Scrape executed. Check logs.");
  }

  // If it's not a testing route, return null so the main router can handle it
  return null; 
}