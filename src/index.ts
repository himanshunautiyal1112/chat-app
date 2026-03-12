import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });

type Room = {
  clients: Set<WebSocket>;
};

const rooms: Map<string, Room> = new Map();

wss.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {

      case "create_room": {
        const roomId = uuidv4().slice(0, 6);

        rooms.set(roomId, {
          clients: new Set([socket]),
        });

        socket.send(JSON.stringify({
          type: "room_created",
          roomId
        }));

        break;
      }

      case "join_room": {
        const room = rooms.get(message.roomId);

        if (!room) {
          socket.send(JSON.stringify({
            type: "error",
            message: "Room not found"
          }));
          return;
        }

        room.clients.add(socket);

        socket.send(JSON.stringify({
          type: "joined",
          roomId: message.roomId
        }));

        break;
      }

      case "chat": {
        const room = rooms.get(message.roomId);

        if (!room) return;

        room.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "chat",
              text: message.text
            }));
          }
        });

        break;
      }

    }

  });

});