/**
 * Single source of truth for the assistant's behaviour.
 * Edit this file to retarget the chat at your capstone
 * (qualification chat, audit summary, or your own AI feature).
 * Server-only: imported by the route handler, never by client code.
 */

// Model id passed to the Anthropic provider.
// Swap for a cheaper/faster tier while developing.
   export const MODEL = "gemini-3.8-flash";// Hard cap on reply length. Keeps cost predictable and streams snappy.
export const MAX_OUTPUT_TOKENS = 1024;

// Lower = more consistent answers; higher = more varied.
export const TEMPERATURE = 0.5;

// The assistant's role, tone and boundaries.
// Written as instructions about behaviour, not a personality blurb.
export const SYSTEM_PROMPT = `You are a lead-qualification assistant for a small web agency.

Goal: learn what the visitor wants built, their timeline, and their budget range,
then summarise it back in two sentences.

Rules:
- Ask one question at a time. Keep replies under 80 words.
- Use plain language; no jargon unless the visitor uses it first.
- If asked something outside the agency's work, say so briefly and steer back.
- Never invent prices, deadlines or commitments.`;
