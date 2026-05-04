// fallow-ignore-file unused-file
import { dispatchApi } from '../_lib/vercelDispatch.js';

export const GET = (request: Request) => dispatchApi(request);
export const OPTIONS = (request: Request) => dispatchApi(request);
