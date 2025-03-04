import * as OS from "os";
import * as Path from "path";
import * as WS from "ws";
import { fileURLToPath } from 'url';
import { RawData } from "ws";
import { WSClientMessage, WSServerMessage } from "../../shared/messageTypes";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = Path.dirname(__filename);
export const hostname = getWlanIPAddress();
export const port = 81;
export const staticDirectory = Path.join(__dirname, '../../frontend/dist');
export const wsUUID: Map<number, WS.WebSocket> = new Map();

function getWlanIPAddress() {
	const interfaces = OS.networkInterfaces();
	for (const iface of interfaces.WLAN || []) {
		if (iface.family === 'IPv4' && !iface.internal) {
			return iface.address;
		}
	}
	return '127.0.0.1';
}

export function findKeyByValue<K, V>(map: Map<K, V>, value: V): K | undefined {
	for (let [key, val] of map.entries()) {
		if (val === value) {
			return key;
		}
	}
	return undefined;
}

export function listeningListener(): void {
	console.log(`HTTP Server running at \t\thttps://${hostname}:${port}/`);
	console.log(`WebSocket server is running at \twss://${hostname}:${port}/\n`);
}

export function parsRaw(data: RawData): WSServerMessage {
	return JSON.parse(data.toString());
}

export function send<T extends WSClientMessage>(ws: WS.WebSocket, message: T) {
	const key = findKeyByValue(wsUUID, ws);
	console.log("Send to", key, ":", message, "\n");
	ws.send(JSON.stringify(message));
}