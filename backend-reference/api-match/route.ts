import {handleMatchRequest} from '../../../lib/matching/http.js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleMatchRequest(request);
}

export async function GET(request: Request) {
  return handleMatchRequest(request);
}
