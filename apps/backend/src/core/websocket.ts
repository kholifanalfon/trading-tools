import { IncomingMessage, Server } from "http";
import { WebSocketServer, WebSocket as WS } from "ws";
import cookieParser from "cookie-parser";
import { jwtVerify } from "jose";
import { config } from "./config";
import { logger } from "./logger";

const secret = new TextEncoder().encode(config.BE_JWT_SECRET);

export interface ExtendedWebSocket extends WS {
  isAlive: boolean;
  rooms: Set<string>;
  customListeners: Map<string, Set<(data: any) => void>>;
  sendEvent(event: string, data: any): boolean;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const val = parts.slice(1).join("=");
    if (name && val) {
      cookies[name] = decodeURIComponent(val);
    }
  });
  return cookies;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients = new Set<ExtendedWebSocket>();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    // Heartbeat ping-pong interval (RFC 6455 compliant)
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((client) => {
        const extWs = client as unknown as ExtendedWebSocket;
        if (extWs.isAlive === false) {
          logger.warn(
            "WebSocket client failed heartbeat check. Terminating connection.",
          );
          extWs.close(1008, "Heartbeat timeout"); // RFC 6455 Policy Violation code
          extWs.terminate();
          return;
        }
        extWs.isAlive = false;
        extWs.ping(); // Opcode 0x9 Ping frame
      });
    }, 30000);

    this.wss.on("close", () => {
      clearInterval(interval);
    });

    // Handle connection
    this.wss.on("connection", (ws: WS) => {
      const extWs = ws as unknown as ExtendedWebSocket;
      extWs.isAlive = true;
      extWs.rooms = new Set<string>();
      extWs.customListeners = new Map<string, Set<(data: any) => void>>();

      // Attach Socket.IO-like sendEvent helper
      extWs.sendEvent = (event: string, data: any) => {
        if (extWs.readyState === WS.OPEN) {
          extWs.send(JSON.stringify({ event, data }));
          return true;
        }
        return false;
      };

      // Wrap the native 'on' method
      const nativeOn = extWs.on.bind(extWs);
      extWs.on = (event: string, listener: (...args: any[]) => void): any => {
        const nativeEvents = [
          "close",
          "error",
          "message",
          "ping",
          "pong",
          "unexpected-response",
          "upgrade",
        ];
        if (nativeEvents.includes(event)) {
          return nativeOn(event as any, listener);
        } else {
          if (!extWs.customListeners.has(event)) {
            extWs.customListeners.set(event, new Set());
          }
          extWs.customListeners.get(event)!.add(listener);
          return extWs;
        }
      };

      this.clients.add(extWs);
      logger.info("New WebSocket connection established.");

      // Listen to native Pong control frames (Opcode 0xA)
      extWs.on("pong", () => {
        extWs.isAlive = true;
      });

      // Parse JSON messages and dispatch custom events
      extWs.on("message", (message: any) => {
        try {
          const messageStr = typeof message === "string" ? message : message.toString();
          logger.info(`WebSocket received message: ${messageStr}`);
          const parsed = JSON.parse(messageStr);
          const { event, data } = parsed;
          if (event && extWs.customListeners.has(event)) {
            logger.info(`Dispatching custom event '${event}' with data: ${JSON.stringify(data)}`);
            extWs.customListeners.get(event)!.forEach((callback) => {
              callback(data);
            });
          } else {
            logger.warn(`No custom listener registered for event: ${event}`);
          }
        } catch (error) {
          logger.warn(
            `Received non-JSON or invalid WebSocket message format from client. Error: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });

      // Register rooms subscriptions using our new clean .on() API
      extWs.on("join", (room: string) => {
        if (typeof room === "string") {
          extWs.rooms.add(room);
          logger.info(`Client joined room: ${room}`);
        }
      });

      extWs.on("leave", (room: string) => {
        if (typeof room === "string") {
          extWs.rooms.delete(room);
          logger.info(`Client left room: ${room}`);
        }
      });

      extWs.on("close", () => {
        this.clients.delete(extWs);
        logger.info("WebSocket connection closed.");
      });

      extWs.on("error", (error) => {
        logger.error(`WebSocket connection error: ${error.message}`);
        this.clients.delete(extWs);
      });
    });

    // Handle HTTP server upgrade
    server.on("upgrade", async (request: IncomingMessage, socket, head) => {
      try {
        const cookieHeader = request.headers.cookie || "";
        const rawCookies = parseCookies(cookieHeader);
        const signedToken = rawCookies.token || "";

        // Unsign the token cookie
        const token = cookieParser.signedCookie(
          signedToken,
          config.BE_JWT_SECRET,
        );
        if (typeof token !== "string" || !token.trim()) {
          throw new Error("Authentication token not found in cookies");
        }

        // Verify the JWT token
        const { payload } = await jwtVerify(token, secret);
        if (!payload || typeof payload.email !== "string") {
          throw new Error("Invalid JWT token");
        }

        // Upgrade connection
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit("connection", ws, request);
        });
      } catch (error) {
        logger.warn(
          `Rejected WebSocket connection: ${error instanceof Error ? error.message : String(error)}`,
        );
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    });
  }

  broadcast(key: string | string[], data: any) {
    if (!this.wss) {
      logger.warn("WebSocketServer is not initialized. Cannot broadcast.");
      return;
    }

    let event: string;
    let room: string | undefined = undefined;

    if (Array.isArray(key)) {
      if (key.length === 0) {
        logger.warn("WebSocket broadcast key array is empty.");
        return;
      }
      if (key.length === 1) {
        event = key[0];
      } else {
        event = key[key.length - 1];
        room = key.slice(0, -1).join(":");
      }
    } else {
      event = key;
    }

    const payload = JSON.stringify({ event, data });
    logger.info(
      `Broadcasting WebSocket event '${event}' to ${room ? `room '${room}'` : "all connected clients"}.`,
    );

    for (const client of this.clients) {
      if (client.readyState === WS.OPEN) {
        if (!room || client.rooms.has(room)) {
          client.send(payload);
        }
      }
    }
  }
}

export const webSocketService = new WebSocketService();
