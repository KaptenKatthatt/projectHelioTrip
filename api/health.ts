import { handle } from 'hono/vercel';
import { buildApp } from './_lib/app.js';

export const runtime = 'nodejs';

const app = buildApp();

export const GET = handle(app);
export default handle(app);
