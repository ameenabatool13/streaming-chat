# Streaming chat (Claude + Vercel AI SDK)

## Run locally
    npm install
    cp .env.example .env.local   # add your ANTHROPIC_API_KEY
    npm run dev                  # http://localhost:3000

## Deploy (gives you the preview URL)
Push to GitHub, import the repo in Vercel, add ANTHROPIC_API_KEY under
Project Settings > Environment Variables, then deploy.

## Where things live
- app/api/chat/route.ts  route handler: streamText -> streamed response
- components/Chat.tsx    useChat UI: thinking indicator, streaming text, stop, auto-scroll
- lib/ai-config.ts       system prompt + model config (server-only, commented)
- lib/greeting.ts        client-safe opening message

## Brief checklist
- Token-by-token streaming: toUIMessageStreamResponse() + useChat parts
- Stop mid-stream: stop() aborts the fetch; abortSignal: req.signal halts generation; partial reply stays in history
- Multi-turn state: useChat holds messages and resends them each turn
- Key server-side only: read from process.env in the route, never imported client-side
- Phone width: 100dvh, 16px input, 44px tap targets, safe-area padding
