import { handleApiRequest } from './api';
import { runScraper } from './scraper';
import { Env } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CHANGE: Use 'await' so the HTTP request waits for the browser to finish
    if (url.pathname === '/trigger-scrape') {
      console.log("Manual trigger initiated. Waiting for scraper...");
      await runScraper(env); 
      return new Response("Scrape finished! Check logs.");
    }

    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    return env.ASSETS.fetch(request); 
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Cron job triggered...");
    ctx.waitUntil(runScraper(env));
  }
};