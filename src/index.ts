import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });

interface user {
    socket: WebSocket,
    room: string
}

let allSocket: user[] = [];

wss.on("connection", (socket) => {

    socket.on("message", (message) => {
        const parseMessage = JSON.parse(message as unknown as string);

        if(parseMessage.type === "join") {
            allSocket.push({
                socket,
                room: parseMessage.payload.roomId
            })
        }
        if(parseMessage.type === "chat") {
            const userRoomId = allSocket.find(x => x.socket === socket)?.room;

            allSocket.forEach(x => {
                if(x.room === userRoomId) {
                    x.socket.send(parseMessage.payload.message)
                }
            })
        }
    })
})