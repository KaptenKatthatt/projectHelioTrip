import { handle } from 'hono/vercel';
import { buildApp } from './_lib/app';

export const runtime = 'nodejs';

const app = buildApp();

export const GET = handle(app);
export const POST = handle(app);
export default handle(app);
