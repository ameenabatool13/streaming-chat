"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { GREETING } from "@/lib/greeting";

const NEAR_BOTTOM_PX = 80;

export default function Chat() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true); // true while the user is at/near the bottom
  const [showJump, setShowJump] = useState(false);

  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  // "submitted" = request sent, no token yet. Also covers an empty assistant shell.
  const thinking =
    status === "submitted" ||
    (status === "streaming" && last?.role === "assistant" && !textOf(last));

  // Auto-scroll only if the user hasn't scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    stickRef.current = near;
    setShowJump(!near);
  }, []);

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    stickRef.current = true;
    setShowJump(false);
  };

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    stickRef.current = true; // sending a message always follows the reply
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="chat">
      <header className="chat-head">
        <h1>Project intake</h1>
        <p>Answers stream in as they're written.</p>
      </header>

      <div className="log" ref={scrollRef} onScroll={onScroll} role="log" aria-live="polite">
        <div className="msg assistant">
          <div className="bubble">{GREETING}</div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="bubble">
              {/* Typed message parts: render text, ignore other part types. */}
              {m.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="msg assistant">
            <div className="bubble thinking" aria-label="Assistant is thinking">
              <i /><i /><i />
            </div>
          </div>
        )}

        {error && (
          <div className="error" role="alert">
            <span>The reply failed. Your conversation is still here.</span>
            <button onClick={() => regenerate()}>Retry</button>
          </div>
        )}
      </div>

      {showJump && (
        <button className="jump" onClick={jumpToLatest}>Jump to latest</button>
      )}

      <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <textarea
          value={input}
          rows={1}
          placeholder="Type your message"
          enterKeyHint="send"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
        />
        {busy ? (
          <button type="button" className="stop" onClick={() => stop()}>Stop</button>
        ) : (
          <button type="submit" disabled={!input.trim()}>Send</button>
        )}
      </form>
    </div>
  );
}

function textOf(m: { parts: { type: string; text?: string }[] }) {
  return m.parts.map((p) => (p.type === "text" ? p.text ?? "" : "")).join("");
}
