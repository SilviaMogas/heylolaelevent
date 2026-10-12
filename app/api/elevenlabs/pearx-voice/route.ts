import { createPearxVoiceHandler } from "@/lib/elevenlabs/pearx-voice";

export const runtime = "nodejs";
export const maxDuration = 30;
const handle = createPearxVoiceHandler();

export function POST(request: Request) {
  return handle(request, process.env);
}
