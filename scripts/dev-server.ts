import { serve } from '@hono/node-server';
import { buildApp } from '../api/_lib/app';

const port = Number.parseInt(process.env.API_PORT ?? '3001', 10);

const app = buildApp();

serve({ fetch: app.fetch, port }, (info) => {
  const addr = `http://localhost:${info.port}`;
  console.log(`[api] listening on ${addr}`);
  console.log(`[api] try: ${addr}/api/planets/earth`);
});
