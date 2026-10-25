let socket: WebSocket | null = null;

export const connectOrderSocket = (
  onMessage: (data: any) => void
) => {

  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {

    return socket;
  }

  socket = new WebSocket(
    "ws://127.0.0.1:8000/ws/orders/"
  );

  socket.onopen = () => {

    console.log(
      "✅ Order WebSocket connected"
    );
  };

  socket.onmessage = (
    event
  ) => {

    try {

      const data = JSON.parse(
        event.data
      );

      onMessage(data);

    } catch (err) {

      console.error(
        "Message parse error:",
        err
      );
    }
  };

  // ❌ REMOVE BIG ERROR THROWING

  socket.onerror = () => {

    console.log(
      "⚠️ Order socket reconnecting..."
    );
  };

  socket.onclose = () => {

    console.log(
      "⚠️ Order WebSocket disconnected"
    );
  };

  return socket;
};

export const disconnectOrderSocket =
  () => {

    if (socket) {

      socket.close();

      socket = null;
    }
  };