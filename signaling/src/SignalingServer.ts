import * as http from "http";
import * as https from "https";
import * as WS from "ws";
import fs from "fs";
import path from "path";
import url from "url";
import selfsigned from "selfsigned";
import { KayoInstance, KayoUser } from "./KayoInstance";
import { getDevHostIP, send } from "./utility";
import { WSRole, WSRoleAssignementMessage } from "../../shared/messageTypes";

const CERT_DIR = "certs";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const IS_DEV = process.env.NODE_ENV === "development";

export class SignaligServer {
	private _server!: http.Server | https.Server;
	private _wsServer!: WS.WebSocketServer;
	private _kayoInstances: Map<string, KayoInstance>;

	public constructor() {
		this._kayoInstances = new Map();
	}

	private _webSocketServerConnect(ws: WS.WebSocket, req: http.IncomingMessage) {
		const reqURL = url.parse(req.url!, true);
		const projectID = reqURL.query.projectID;
		if (typeof projectID !== "string") {
			console.error("ProjectID is not a string!");
			return;
		}

		let role: WSRole = "Follower";

		let kayoInstance = this._kayoInstances.get(projectID);
		if (!kayoInstance) {
			kayoInstance = new KayoInstance(projectID, this);
			this._kayoInstances.set(projectID, kayoInstance);
			role = "Leader";
		}

		const user = new KayoUser(kayoInstance, ws, role, req.socket.remoteAddress);
		kayoInstance.users.add(user);

		ws.on("message", user.onWebSocketMessage.bind(user));
		ws.on("close", user.onWebSocketClose.bind(user));
		ws.on("error", user.onWebSocketError.bind(user));

		send<WSRoleAssignementMessage>(ws, { type: "role assignment", content: { role, id: user.guid, leaderIdentiy: kayoInstance.leader !== undefined ? kayoInstance.leader.getIdentity() : null } });
	}

	public deleteKayoInstance(kayoInstance: KayoInstance) {
		this._kayoInstances.delete(kayoInstance.projectID);
		console.log(`Deleted KayoInstance ${kayoInstance.projectID}`);
	}

	public async start() {
		if (IS_DEV) {
			this._server = https.createServer(await SignaligServer._ensureDevCerts(), (_, res) => {
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end("Signaling Server (Dev)!");
			});
			console.log("Dev IP probably: \t", getDevHostIP());
		} else {
			this._server = http.createServer((_, res) => {
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end("Signaling Server!");
			});
		}

		this._wsServer = new WS.WebSocketServer({ server: this._server, maxPayload: 33554432 });
		this._wsServer.on("error", (e) => console.log(e));
		this._wsServer.on("connection", this._webSocketServerConnect.bind(this));

		this._server.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	}

	private static async _ensureDevCerts() {
		if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR);

		const keyPath = path.join(CERT_DIR, "key.pem");
		const certPath = path.join(CERT_DIR, "cert.pem");

		if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
			const attrs = [{ name: "commonName" }];
			const pems = await selfsigned.generate(attrs);
			fs.writeFileSync(keyPath, pems.private);
			fs.writeFileSync(certPath, pems.cert);
		}

		return {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath),
		};
	}
}
