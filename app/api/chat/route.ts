import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { MAX_OUTPUT_TOKENS, MODEL, SYSTEM_PROMPT, TEMPERATURE } from "@/lib/ai-config";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "Server is missing GOOGLE_GENERATIVE_AI_API_KEY." }, { status: 500 });
  }

  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    return Response.json({ error: "Request body must include a non-empty messages array." }, { status: 400 });
  }

  const result = streamText({
    model: google(MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    onError: () => "Something went wrong while generating the reply. Try again.",
  });
}