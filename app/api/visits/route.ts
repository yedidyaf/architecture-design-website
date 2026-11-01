import {NextResponse} from "next/server";

// Visitor counter backed by Upstash Redis (Vercel Marketplace → Upstash / KV)
// through its REST API. Env vars are injected automatically by that integration.
const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const KEY = "site:visitors";

export const dynamic = "force-dynamic";

async function redis(command: string[]): Promise<number | null> {
  if (!URL_ || !TOKEN) return null;
  const res = await fetch(URL_, {
    method: "POST",
    headers: {Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json"},
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const {result} = await res.json();
  return Number(result ?? 0);
}

function respond(count: number | null) {
  return count === null
    ? NextResponse.json({error: "counter unavailable"}, {status: 503})
    : NextResponse.json({count}, {headers: {"Cache-Control": "no-store"}});
}

export async function GET() {
  return respond(await redis(["GET", KEY]));
}

export async function POST() {
  return respond(await redis(["INCR", KEY]));
}
