import { useContext, useEffect } from "react";
import { WebSocketContext } from "@/shared/providers/websocket-provider";
import { ClientSocket } from "@/shared/types/websocket.types";
import { WebSocketError } from "@/shared/errors/websocket-error";

export type WebSocketKey = string | string[];

export function parseWebSocketKey(key?: WebSocketKey) {
  if (!key) {
    return { event: undefined, room: undefined };
  }

  if (Array.isArray(key)) {
    if (key.length === 0) {
      throw new WebSocketError("WebSocket key array cannot be empty");
    }
    if (key.length === 1) {
      return { event: key[0], room: undefined };
    }
    const event = key[key.length - 1];
    const room = key.slice(0, -1).join(":");
    return { event, room };
  }

  return { event: key, room: undefined };
}

export function useWebSocket(key?: WebSocketKey, onMessage?: (data: any) => void): ClientSocket {
  const socket = useContext(WebSocketContext);
  if (!socket) {
    throw new WebSocketError("useWebSocket must be used within a WebSocketProvider");
  }

  const { event, room } = parseWebSocketKey(key);

  // Handle room subscription reference counting
  useEffect(() => {
    if (room) {
      socket.joinRoom(room);
      return () => {
        socket.leaveRoom(room);
      };
    }
  }, [room, socket]);

  // Handle event callback registration
  useEffect(() => {
    if (event && onMessage) {
      socket.on(event, onMessage);
      return () => {
        socket.off(event, onMessage);
      };
    }
  }, [event, onMessage, socket]);

  return socket;
}
