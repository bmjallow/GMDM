import { handleApiRequest } from './api';
import { runScraper } from './scraper';
import { Env } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // The trigger-scrape route has been removed for security.
    // The scraper runs automatically via the Cron Trigger.

    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    return env.ASSETS.fetch(request); 
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Cron job triggered: Checking for new data...");
    ctx.waitUntil(runScraper(env));
  }
};