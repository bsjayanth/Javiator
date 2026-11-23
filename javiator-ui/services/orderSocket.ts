import { WS_BASE } from "./api";

export type OrderSocketPayload = {
  type?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

let socket: WebSocket | null = null;

export const connectOrderSocket = (
  onMessage: (data: OrderSocketPayload) => void
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(`${WS_BASE}/ws/orders/`);

  socket.onopen = () => {
    console.log("Order WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as OrderSocketPayload;
      onMessage(data);
    } catch (err) {
      console.error("Message parse error:", err);
    }
  };

  socket.onerror = () => {
    console.log("Order socket connection interrupted");
  };

  socket.onclose = () => {
    console.log("Order WebSocket disconnected");
  };

  return socket;
};

export const disconnectOrderSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
