import React, { createContext, useEffect, useRef } from "react";
import { WsMessage, ClientSocket } from "@/shared/types/websocket.types";
import { useAuthStore } from "@/shared/stores/auth.store";

const API_URL = import.meta.env.FE_VITE_API_URL || "http://localhost:3000";
const WS_URL = API_URL.replace(/^http/, "ws");

export const WebSocketContext = createContext<ClientSocket | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { isAuthenticated } = useAuthStore();

  // Track all callbacks registered globally
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  // Track how many components are currently listening to a room
  const roomRefCountRef = useRef<Map<string, number>>(new Map());

  // Client socket helper exposed to the application
  const clientSocketRef = useRef<ClientSocket>({
    on: (event, cb) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(cb);
    },
    off: (event, cb) => {
      if (listenersRef.current.has(event)) {
        listenersRef.current.get(event)!.delete(cb);
      }
    },
    emit: (event, data) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ event, data }));
      }
    },
    joinRoom: (room) => {
      const currentCount = roomRefCountRef.current.get(room) || 0;
      roomRefCountRef.current.set(room, currentCount + 1);

      // Only send join message to the server if this is the first subscription
      if (currentCount === 0) {
        clientSocketRef.current.emit("join", room);
      }
    },
    leaveRoom: (room) => {
      const currentCount = roomRefCountRef.current.get(room) || 0;
      if (currentCount <= 1) {
        roomRefCountRef.current.delete(room);
        clientSocketRef.current.emit("leave", room);
      } else {
        roomRefCountRef.current.set(room, currentCount - 1);
      }
    },
  });

  useEffect(() => {
    let active = true;

    function connect() {
      if (socketRef.current) {
        socketRef.current.close();
      }

      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;

        // Re-subscribe to all active rooms on reconnect
        roomRefCountRef.current.forEach((_, room) => {
          clientSocketRef.current.emit("join", room);
        });
      };

      ws.onmessage = (eventMsg) => {
        try {
          const payload: WsMessage = JSON.parse(eventMsg.data);
          const { event, data } = payload;
          if (event && listenersRef.current.has(event) && active) {
            listenersRef.current.get(event)!.forEach((cb) => cb(data));
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (e) => {
        socketRef.current = null;
        if (active) {
          if (e.code === 1008) {
            console.warn("WebSocket closed due to policy violation. Reconnecting with standard delay.");
          }

          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error occurred:", err);
        ws.close();
      };
    }

    if (isAuthenticated) {
      connect();
    }

    return () => {
      active = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return <WebSocketContext.Provider value={clientSocketRef.current}>{children}</WebSocketContext.Provider>;
}
