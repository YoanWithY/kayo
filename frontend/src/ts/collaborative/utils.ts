import { RTEndOfFile, RTMessage, RTStartOfFile, WSServerEndOfFileMessage, WSServerMessage, WSServerStartOfFileMessage, WSTarget } from "../../../../shared/messageTypes";
import { ws } from "./main";

export function sendWS<T extends WSServerMessage>(message: T) {
	console.log("WS Send:", message);
	ws.send(JSON.stringify(message));
}

export function sendWSFile(file: File, target: WSTarget, update?: (bytesSend: number) => void) {
	sendWS<WSServerStartOfFileMessage>({ type: "start of file", content: { target: target, fileName: file.name } });
	file.arrayBuffer().then((buffer: ArrayBuffer) => {
		let offset = 0;
		let bytesSend = 0;
		const chunkSize = 16777216;
		function func() {
			if (bytesSend >= buffer.byteLength) {
				sendWS<WSServerEndOfFileMessage>({ type: "end of file", content: { target: target, fileName: file.name } });
				clearInterval(interval);
				return;
			}

			const chunk = buffer.slice(offset, offset + chunkSize);
			ws.send(chunk);
			offset += chunkSize;
			bytesSend += chunk.byteLength;

			if (update)
				update(bytesSend);
		}

		func();
		const interval = setInterval(func, 200);
	});
}

export function sendRT<T extends RTMessage>(dataChannel: RTCDataChannel, message: T) {
	console.log("RT Send:", message);
	dataChannel.send(JSON.stringify(message));
}

export function multicastRT<T extends RTMessage>(dataChannels: RTCDataChannel[], message: T) {
	for (const dataChannel of dataChannels)
		sendRT<T>(dataChannel, message);
}

export function sendRTChunked(dataChannel: RTCDataChannel, buffer: ArrayBuffer, chunkSize: number, id: number = 0, update?: (bytesSend: number, id: number) => void, onFinish?: (dataChannel: RTCDataChannel, id: number) => void) {
	dataChannel.bufferedAmountLowThreshold = chunkSize * 3.5;
	let offset = 0;
	let bytesSend = 0;

	const sendNextChunk = () => {
		if (offset >= buffer.byteLength) {
			dataChannel.onbufferedamountlow = null;
			if (onFinish)
				onFinish(dataChannel, id);
			return;
		}

		const chunk = buffer.slice(offset, offset + chunkSize);
		dataChannel.send(chunk);
		offset += chunkSize;
		bytesSend += chunk.byteLength;

		if (update)
			update(bytesSend, id);

		if (dataChannel.bufferedAmount > dataChannel.bufferedAmountLowThreshold) {
			dataChannel.onbufferedamountlow = sendNextChunk;
		} else {
			dataChannel.onbufferedamountlow = null;
			sendNextChunk();
		}
	}
	sendNextChunk();
}

export function sendRTLarge(dataChannel: RTCDataChannel, buffer: ArrayBuffer, connection?: RTCPeerConnection, id: number = 0, update?: (byteSend: number, id: number) => void, onFinish?: (dataChannel: RTCDataChannel, id: number) => void) {
	let chunkSize = connection?.sctp?.maxMessageSize;
	if (!chunkSize)
		chunkSize = 16 * 1024;
	sendRTChunked(dataChannel, buffer, chunkSize, id, update, onFinish);
}

export function sendRTFile(file: File, dataChannel: RTCDataChannel, connection: RTCPeerConnection, id: number = 0, update?: (byteSend: number, id: number) => void) {
	file.arrayBuffer().then(buffer => {
		sendRT<RTStartOfFile>(dataChannel, { type: "start of file", content: file.name });
		sendRTLarge(dataChannel, buffer, connection, id, update, (dataChannel: RTCDataChannel) => sendRT<RTEndOfFile>(dataChannel, { type: "end of file", content: null }));
	});
}

export function multicastRTFile(file: File, connections: { dataChanel: RTCDataChannel, connection: RTCPeerConnection, id: number }[], update?: (bytesSend: number, id: number) => void) {
	file.arrayBuffer().then(buffer => {
		for (let i = 0; i < connections.length; i++) {
			const con = connections[i];
			const dataChannel = con.dataChanel;
			const connection = con.connection;
			sendRT<RTStartOfFile>(dataChannel, { type: "start of file", content: file.name });
			sendRTLarge(dataChannel, buffer, connection, con.id, update, (dataChannel: RTCDataChannel) => sendRT<RTEndOfFile>(dataChannel, { type: "end of file", content: null })
			);
		}
	});
}