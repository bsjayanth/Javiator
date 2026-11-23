import { WS_BASE } from "./api";

export type OrderSocketPayload = {
  type?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

const RECONNECT_DELAYS_MS = [2000, 4000, 8000, 15000];

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let manualClose = false;

export const connectOrderSocket = (
  onMessage: (data: OrderSocketPayload) => void
): WebSocket | null => {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;
  if (!token) {
    return null;
  }

  manualClose = false;
  const wsUrl = `${WS_BASE}/ws/orders/?token=${encodeURIComponent(token)}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    reconnectAttempt = 0;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as OrderSocketPayload;
      onMessage(data);
    } catch (err) {
      console.error("Order message parse error:", err);
    }
  };

  socket.onerror = () => {
    // Handled cleanly via onclose backoff.
  };

  socket.onclose = (event) => {
    socket = null;
    if (manualClose || event.code === 4401) {
      return;
    }

    if (reconnectAttempt < RECONNECT_DELAYS_MS.length) {
      const delay = RECONNECT_DELAYS_MS[reconnectAttempt];
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(() => {
        connectOrderSocket(onMessage);
      }, delay);
    }
  };

  return socket;
};

export const disconnectOrderSocket = () => {
  manualClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempt = 0;

  if (socket) {
    socket.close();
    socket = null;
  }
};
