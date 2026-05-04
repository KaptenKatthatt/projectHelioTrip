// fallow-ignore-file unused-file
import type { Hono } from 'hono';

import { buildApp } from './app.js';

let app: Hono | undefined;

// fallow-ignore-next-line unused-export
export const dispatchApi = (request: Request): Response | Promise<Response> => {
  if (!app) app = buildApp();
  return app.fetch(request);
};
