import type { Hono } from 'hono';

import { buildApp } from './app.js';

let app: Hono | undefined;

export const dispatchApi = (request: Request): Response | Promise<Response> => {
  if (!app) app = buildApp();
  return app.fetch(request);
};
