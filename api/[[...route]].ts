import { buildApp } from './_lib/app.js';

const app = buildApp();

export const GET = (request: Request) => app.fetch(request);
export const POST = (request: Request) => app.fetch(request);
export const PUT = (request: Request) => app.fetch(request);
export const PATCH = (request: Request) => app.fetch(request);
export const DELETE = (request: Request) => app.fetch(request);
export const OPTIONS = (request: Request) => app.fetch(request);
export const HEAD = (request: Request) => app.fetch(request);
