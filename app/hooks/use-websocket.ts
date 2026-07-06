"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type WebSocketMessage = {
  type: string;
  payload: unknown;
};

type UseWebSocketOptions = {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCount.current = 0;
        console.log("[WebSocket] Connected to", url);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          onMessage?.(message);
        } catch (e) {
          console.error("[WebSocket] Failed to parse message:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[WebSocket] Disconnected. Reconnecting...");

        if (reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current++;
          setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };
    } catch (e) {
      console.error("[WebSocket] Connection failed:", e);
      if (reconnectCount.current < maxReconnectAttempts) {
        reconnectCount.current++;
        setTimeout(connect, reconnectInterval);
      }
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, lastMessage, send };
}
