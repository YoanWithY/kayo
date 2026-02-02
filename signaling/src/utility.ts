import * as WS from "ws";
import * as OS from "os";
import { WSClientMessage, WSServerMessage } from "../../shared/messageTypes";

export function parsRaw(data: WS.RawData): WSServerMessage {
	return JSON.parse(data.toString());
}

export function send<T extends WSClientMessage>(ws: WS.WebSocket, message: T) {
	ws.send(JSON.stringify(message));
}

/**
 * Returns the most likely IPv4 address to reach this server from Windows host.
 * Falls back to 127.0.0.1 if no external interface is found.
 */
export function getDevHostIP(): string {
	const interfaces = OS.networkInterfaces();

	for (const name of Object.keys(interfaces)) {
		const addrs = interfaces[name];
		if (!addrs) continue;
		for (const addr of addrs) {
			// IPv4, not internal (skip loopback)
			if (addr.family === "IPv4" && !addr.internal) {
				return addr.address;
			}
		}
	}

	// fallback
	return "127.0.0.1";
}