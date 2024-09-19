import * as http from "http";
import * as WS from "ws";
import { hostname, listeningListener, parsRaw, port, send, wsUUID } from "./utility.js";
const server = http.createServer();
const wss = new WS.WebSocketServer({
    server: server,
    maxPayload: 33554432
});
wss.on("error", (e) => { console.log(e); });
wss.on("connection", webSocketServerConnect);
server.listen(port, hostname, listeningListener);
let leaderWebSocket = null;
let wsUUIDCounter = 0;
function webSocketServerConnect(ws, req) {
    const identity = { id: wsUUIDCounter++, origin: req.socket.remoteAddress };
    wsUUID.set(identity.id, ws);
    console.log("Client connected:", identity, "\n");
    ws.on('message', webSocketMessage);
    ws.on('close', webSocketClose);
    ws.on("error", (err) => { console.log(err); });
    const role = (identity.id === 0) ? "Leader" : "Follower";
    send(ws, { type: "role assignment", content: role });
    function webSocketClose(code, readon) {
        console.log("Close:", identity, "with code:", code);
        wsUUID.delete(identity.id);
    }
    let pendingFilename = undefined;
    let pendingTarget = undefined;
    function webSocketMessage(data, isBinary) {
        if (isBinary) {
            console.log("Got Binary from", identity, "| size", data.byteLength / 1024, "kiB");
            switch (pendingTarget) {
                case "Leader":
                    {
                        leaderWebSocket?.send(data);
                        break;
                    }
                    ;
                case "All":
                    {
                        for (let webs of wsUUID.values())
                            webs.send(data);
                        break;
                    }
                    ;
                case "All but Me":
                    {
                        for (let webs of wsUUID.values())
                            if (webs !== ws)
                                webs.send(data);
                        break;
                    }
                    ;
            }
        }
        else {
            const messageObj = parsRaw(data);
            console.log("Recived: ", messageObj, "\nfrom", identity, "\n");
            const func = funcMap[messageObj.type];
            if (func)
                func(messageObj.content);
        }
    }
    const funcMap = {
        "string": (content) => {
            console.log(content);
        },
        "follower ready": (content) => {
            if (!leaderWebSocket) {
                console.error("No leader.");
                return;
            }
            send(leaderWebSocket, { type: "new follower", content: identity });
        },
        "leader ready": (content) => {
            leaderWebSocket = ws;
        },
        "offer": (content) => {
            const wsOffer = content;
            const targetIdentity = wsOffer.targetIdentity;
            const targetWebSocket = wsUUID.get(targetIdentity.id);
            if (!targetWebSocket) {
                console.error(`Identity id ${targetIdentity.id} unknown.`);
                return;
            }
            send(targetWebSocket, {
                type: "offer",
                content: {
                    targetIdentity: wsOffer.targetIdentity,
                    originIdentity: identity,
                    offer: wsOffer.offer
                }
            });
        },
        "ice candidate": (content) => {
            const wsCandidate = content;
            const targetIdentity = wsCandidate.targetIdentity;
            const targetWebSocket = wsUUID.get(targetIdentity.id);
            if (!targetWebSocket) {
                console.error(`Identity id ${targetIdentity.id} unknown.`);
                return;
            }
            send(targetWebSocket, {
                type: "ice candidate",
                content: {
                    targetIdentity: wsCandidate.targetIdentity,
                    originIdentity: identity,
                    candidate: wsCandidate.candidate
                }
            });
        },
        "start of file": (content) => {
            const c = content;
            pendingFilename = c.fileName;
            pendingTarget = c.target;
            switch (pendingTarget) {
                case "Leader":
                    {
                        if (leaderWebSocket)
                            send(leaderWebSocket, { type: "start of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
                case "All":
                    {
                        for (let webs of wsUUID.values())
                            send(webs, { type: "start of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
                case "All but Me":
                    {
                        for (let webs of wsUUID.values())
                            if (webs !== ws)
                                send(webs, { type: "start of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
            }
        },
        "end of file": (content) => {
            const c = content;
            pendingFilename = c.fileName;
            pendingTarget = c.target;
            switch (pendingTarget) {
                case "Leader":
                    {
                        if (leaderWebSocket)
                            send(leaderWebSocket, { type: "end of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
                case "All":
                    {
                        for (let webs of wsUUID.values())
                            send(webs, { type: "end of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
                case "All but Me":
                    {
                        for (let webs of wsUUID.values())
                            if (webs !== ws)
                                send(webs, { type: "end of file", content: { fileName: c.fileName } });
                        break;
                    }
                    ;
            }
        }
    };
}
