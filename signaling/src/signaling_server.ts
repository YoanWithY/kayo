import * as http from "http";
import * as https from "https";
import * as WS from "ws";
import fs from 'fs';
import { hostname, listeningListener, parsRaw, port, send, wsUUID } from "./utility.js";
import { WSClientEndOfFileMessage, WSClientIceCandidateMessage, WSClientRTCOfferMessage, WSClientStartOfFileMessage, WSNewFollower, WSRole, WSRoleAssignementMessage, WSServerFileInfo, WSServerIceCandidate, WSServerMessageType, WSServerOffer, WSTarget } from "../../shared/messageTypes.js"

const server = https.createServer({
	key: fs.readFileSync('../local.key'),
	cert: fs.readFileSync('../local.crt'),
});
const wss = new WS.WebSocketServer({
	server: server,
	maxPayload: 33554432
});
wss.on("error", (e) => { console.log(e); });
wss.on("connection", webSocketServerConnect);
server.listen(port, hostname, listeningListener);

let leaderWebSocket: WS.WebSocket | null = null;
let wsUUIDCounter = 0;

function webSocketServerConnect(ws: WS.WebSocket, req: http.IncomingMessage) {
	const identity = { id: wsUUIDCounter++, origin: req.socket.remoteAddress };
	wsUUID.set(identity.id, ws);
	console.log("Client connected:", identity, "\n");

	ws.on('message', webSocketMessage);
	ws.on('close', webSocketClose);
	ws.on("error", (err: Error) => { console.log(err); });

	const role: WSRole = (identity.id === 0) ? "Leader" : "Follower";
	send<WSRoleAssignementMessage>(ws, { type: "role assignment", content: { role, id: identity.id } });

	function webSocketClose(code: number, readon: Buffer) {
		console.log("Close:", identity, "with code:", code);
		wsUUID.delete(identity.id);
		if (wsUUID.size === 0) {
			wsUUIDCounter = 0;
			console.log("Rest");
		}
	}

	let pendingFilename: string | undefined = undefined;
	let pendingTarget: WSTarget | undefined = undefined;
	function webSocketMessage(data: WS.RawData, isBinary: Boolean) {
		if (isBinary) {
			console.log("Got Binary from", identity, "| size", (data as Buffer).byteLength / 1024, "kiB");
			switch (pendingTarget) {
				case "Leader": {
					leaderWebSocket?.send(data);
					break;
				};
				case "All": {
					for (let webs of wsUUID.values())
						webs.send(data);

					break;
				};
				case "All but Me": {
					for (let webs of wsUUID.values())
						if (webs !== ws)
							webs.send(data);
					break;
				};
			}
		} else {
			const messageObj = parsRaw(data);
			console.log("Recived: ", messageObj, "\nfrom", identity, "\n");
			const func = funcMap[messageObj.type as WSServerMessageType];
			if (func)
				func(messageObj.content);
		}

	}

	const funcMap: { [K in WSServerMessageType]: (content: any) => void } = {
		"string": (content: any) => {
			console.log(content);
		},

		"follower ready": (content: any) => {
			if (!leaderWebSocket) {
				console.error("No leader.");
				return;
			}
			send<WSNewFollower>(leaderWebSocket, { type: "new follower", content: identity });
		},

		"leader ready": (content: any) => {
			leaderWebSocket = ws;
		},

		"offer": (content: any) => {
			const wsOffer = content as WSServerOffer;
			const targetIdentity = wsOffer.targetIdentity;
			const targetWebSocket = wsUUID.get(targetIdentity.id);
			if (!targetWebSocket) {
				console.error(`Identity id ${targetIdentity.id} unknown.`);
				return;
			}
			send<WSClientRTCOfferMessage>(targetWebSocket, {
				type: "offer",
				content: {
					targetIdentity: wsOffer.targetIdentity,
					originIdentity: identity,
					offer: wsOffer.offer
				}
			});
		},

		"ice candidate": (content: any) => {
			const wsCandidate = content as unknown as WSServerIceCandidate;
			const targetIdentity = wsCandidate.targetIdentity;
			const targetWebSocket = wsUUID.get(targetIdentity.id);
			if (!targetWebSocket) {
				console.error(`Identity id ${targetIdentity.id} unknown.`);
				return;
			}
			send<WSClientIceCandidateMessage>(targetWebSocket, {
				type: "ice candidate",
				content: {
					targetIdentity: wsCandidate.targetIdentity,
					originIdentity: identity,
					candidate: wsCandidate.candidate
				}
			});
		},

		"start of file": (content: any) => {
			const c = content as WSServerFileInfo;
			pendingFilename = c.fileName;
			pendingTarget = c.target;
			switch (pendingTarget) {
				case "Leader": {
					if (leaderWebSocket)
						send<WSClientStartOfFileMessage>(leaderWebSocket, { type: "start of file", content: { fileName: c.fileName } });
					break;
				};
				case "All": {
					for (let webs of wsUUID.values())
						send<WSClientStartOfFileMessage>(webs, { type: "start of file", content: { fileName: c.fileName } });

					break;
				};
				case "All but Me": {
					for (let webs of wsUUID.values())
						if (webs !== ws)
							send<WSClientStartOfFileMessage>(webs, { type: "start of file", content: { fileName: c.fileName } });
					break;
				};
			}
		},

		"end of file": (content: any) => {
			const c = content as WSServerFileInfo;
			pendingFilename = c.fileName;
			pendingTarget = c.target;
			switch (pendingTarget) {
				case "Leader": {
					if (leaderWebSocket)
						send<WSClientEndOfFileMessage>(leaderWebSocket, { type: "end of file", content: { fileName: c.fileName } });
					break;
				};
				case "All": {
					for (let webs of wsUUID.values())
						send<WSClientEndOfFileMessage>(webs, { type: "end of file", content: { fileName: c.fileName } });

					break;
				};
				case "All but Me": {
					for (let webs of wsUUID.values())
						if (webs !== ws)
							send<WSClientEndOfFileMessage>(webs, { type: "end of file", content: { fileName: c.fileName } });
					break;
				};
			}
		}
	}
}