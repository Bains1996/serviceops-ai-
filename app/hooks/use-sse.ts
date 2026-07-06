"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type SSEEvent = {
  type: string;
  data: unknown;
};

type UseSSEOptions = {
  url: string;
  onEvent?: (event: SSEEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

export function useSSE({
  url,
  onEvent,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
}: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectCount = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        reconnectCount.current = 0;
        console.log("[SSE] Connected to", url);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const sseEvent = { type: "message", data };
          setLastEvent(sseEvent);
          onEvent?.(sseEvent);
        } catch (e) {
          console.error("[SSE] Failed to parse message:", e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        console.log("[SSE] Disconnected. Reconnecting...");

        if (reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current++;
          setTimeout(connect, reconnectInterval);
        }
      };
    } catch (e) {
      console.error("[SSE] Connection failed:", e);
      if (reconnectCount.current < maxReconnectAttempts) {
        reconnectCount.current++;
        setTimeout(connect, reconnectInterval);
      }
    }
  }, [url, onEvent, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  const close = useCallback(() => {
    eventSourceRef.current?.close();
  }, []);

  return { isConnected, lastEvent, close };
}
