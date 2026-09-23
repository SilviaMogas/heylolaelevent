import { NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/elevenlabs/signed-url";

export const runtime = "nodejs";

export async function GET() {
  const result = await getSignedUrl(fetch, process.env);
  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }
  return NextResponse.json({ signedUrl: result.signedUrl });
}
