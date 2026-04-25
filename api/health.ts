import { handle } from 'hono/vercel';
import { Hono } from 'hono';

export const runtime = 'nodejs';

const app = new Hono();
app.get('*', (c) => c.json({ status: 'ok' }));

export const GET = handle(app);
export default handle(app);
