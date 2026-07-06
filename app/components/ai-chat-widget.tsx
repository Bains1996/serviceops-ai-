"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AIChatWidgetProps = {
  companyId?: string;
};

const systemPrompt = `You are ServiceOps AI, a dispatch operations assistant for trucking companies. You help dispatchers with:
- Load assignments and driver recommendations
- Rate analysis and negotiation
- HOS compliance checks
- Exception handling (delays, breakdowns)
- Fleet utilization insights

Be concise, professional, and actionable. Use specific numbers when possible.`;

export function AIChatWidget({ companyId = "default" }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your dispatch AI assistant. I can help with load assignments, rate analysis, compliance checks, and exception handling. What do you need?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          companyId,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Connection error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--accent)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 16px rgba(50,121,249,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "all 0.3s var(--ease-out-expo)",
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="animate-scale-in"
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            width: "380px",
            height: "520px",
            background: "var(--bg)",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
          }}
        >
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="body-md" style={{ fontWeight: "600" }}>Dispatch AI</p>
              <p className="small" style={{ color: "var(--green)" }}>Online</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "var(--accent)" : "var(--grey-10)",
                    color: msg.role === "user" ? "white" : "var(--text)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "var(--grey-10)" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--grey-300)",
                          animation: `pulse 1.4s infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about loads, rates, compliance..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                opacity: input.trim() && !isLoading ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
