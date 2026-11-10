import { handleApiRequest } from './api';
import { runScraper } from './scraper';
import { Env } from './types';
import { handleTestingRoutes } from './testing'; // <-- Import the new file

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Check for testing routes first
    const testResponse = await handleTestingRoutes(request, env);
    if (testResponse) return testResponse;

    // 2. API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    // 3. Serve Frontend
    return env.ASSETS.fetch(request); 
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Cron job triggered: Checking for new data...");
    ctx.waitUntil(runScraper(env));
  }
};