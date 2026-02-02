import {
	Identity,
	WSClientMessageType,
	WSClientMessage,
	WSClientOffer,
	WSClientIceCandidate,
	WSClientFileInfo,
	WSServerMessage,
	WSTarget,
	WSServerStartOfFileMessage,
	WSServerEndOfFileMessage,
	RTMessage,
	RTStartOfFile,
	RTEndOfFile,
	WSRoleID,
} from "../../../../shared/messageTypes";
import { Role } from "./Role";
import { Follower } from "./Follower";
import { Leader } from "./Leader";

export class PTPX {
	public protocol: string;
	public hostname: string;
	public wsUrl!: string;
	public role!: Role;
	public ws!: WebSocket;
	public pendingFilename = "";
	public dataArr: any[] = [];
	public messageCallback: (value: string) => void;
	private _connectLog: { onSuccess: () => void, onError: () => void }[] = [];

	public constructor() {
		this.protocol = "wss:";
		this.hostname = window.location.hostname;
		if (import.meta.env.DEV)
			this.hostname = "localhost:3000";

		this.messageCallback = (_1: string) => { };
	}

	public connect(fsRootName: string, onSuccess: () => void, onError: () => void) {
		this.wsUrl = `${this.protocol}//${this.hostname}?projectID=${fsRootName}`;
		this.ws = new WebSocket(this.wsUrl);
		this.ws.binaryType = "arraybuffer";
		this._connectLog.push({ onSuccess, onError });

		this.ws.onmessage = async (event: MessageEvent) => {
			if (typeof event.data === "string") {
				const message = JSON.parse(event.data) as WSClientMessage;
				console.log("WS Recevied: ", message);
				const func = this.wsFuncMap[message.type];
				func(message.content);
			} else {
				this.dataArr.push(event.data);
			}
		};
	}

	public wsFuncMap: { [K in WSClientMessageType]: (content: any) => void } = {
		"offer": (content: any) => {
			const wsOffer = content as WSClientOffer;
			this.role.acceptOffer(wsOffer.offer, wsOffer.originIdentity);
		},

		"string": (content: any) => {
			console.log(content);
		},

		"role assignment": (content: any) => {
			const roleID = content as WSRoleID;
			this.role = roleID.role == "Follower" ? new Follower(this, roleID.id) : new Leader(this, roleID.id);
			this.role.answerRoleIsReady();
			this.role.addMessageListener(this.messageCallback);
			this._connectLog[0].onSuccess();
		},

		"new follower": (content: any) => {
			(this.role as Leader).newFollower(content as Identity);
		},

		"ice candidate": (content: any) => {
			this.role.addIceCandidate(content as WSClientIceCandidate);
		},

		"start of file": (content: any) => {
			const c = content as WSClientFileInfo;
			this.pendingFilename = c.fileName;
		},

		"end of file": (content: any) => {
			console.log(content);
			const receivedBlob = new Blob(this.dataArr);
			const downloadLink = document.createElement("a");
			downloadLink.href = URL.createObjectURL(receivedBlob);
			downloadLink.download = this.pendingFilename;
			downloadLink.click();
			this.dataArr.length = 0;
		},
	};

	public sendWS<T extends WSServerMessage>(message: T) {
		console.log("WS Send:", message);
		this.ws.send(JSON.stringify(message));
	}

	public sendWSFile(file: File, target: WSTarget, update?: (bytesSend: number) => void) {
		this.sendWS<WSServerStartOfFileMessage>({
			type: "start of file",
			content: { target: target, fileName: file.name },
		});
		const bufferCallback = (buffer: ArrayBuffer) => {
			let offset = 0;
			let bytesSend = 0;
			const chunkSize = 16777216;
			const func = () => {
				if (bytesSend >= buffer.byteLength) {
					this.sendWS<WSServerEndOfFileMessage>({
						type: "end of file",
						content: { target: target, fileName: file.name },
					});
					clearInterval(interval);
					return;
				}

				const chunk = buffer.slice(offset, offset + chunkSize);
				this.ws.send(chunk);
				offset += chunkSize;
				bytesSend += chunk.byteLength;

				if (update) update(bytesSend);
			};

			func();
			const interval = setInterval(func, 200);
		};
		file.arrayBuffer().then(bufferCallback);
	}

	public sendRT<T extends RTMessage>(dataChannel: RTCDataChannel, message: T) {
		console.log("RT Send:", message);
		dataChannel.send(JSON.stringify(message));
	}

	public multicastRT<T extends RTMessage>(dataChannels: RTCDataChannel[], message: T) {
		for (const dataChannel of dataChannels) this.sendRT<T>(dataChannel, message);
	}

	public sendRTChunked(
		dataChannel: RTCDataChannel,
		buffer: ArrayBuffer,
		chunkSize: number,
		id: number = 0,
		update?: (bytesSend: number, id: number) => void,
		onFinish?: (dataChannel: RTCDataChannel, id: number) => void,
	) {
		dataChannel.bufferedAmountLowThreshold = chunkSize * 3.5;
		let offset = 0;
		let bytesSend = 0;

		const sendNextChunk = () => {
			if (offset >= buffer.byteLength) {
				dataChannel.onbufferedamountlow = null;
				if (onFinish) onFinish(dataChannel, id);
				return;
			}

			const chunk = buffer.slice(offset, offset + chunkSize);
			dataChannel.send(chunk);
			offset += chunkSize;
			bytesSend += chunk.byteLength;

			if (update) update(bytesSend, id);

			if (dataChannel.bufferedAmount > dataChannel.bufferedAmountLowThreshold) {
				dataChannel.onbufferedamountlow = sendNextChunk;
			} else {
				dataChannel.onbufferedamountlow = null;
				sendNextChunk();
			}
		};
		sendNextChunk();
	}

	public sendRTLarge(
		dataChannel: RTCDataChannel,
		buffer: ArrayBuffer,
		connection?: RTCPeerConnection,
		id: number = 0,
		update?: (byteSend: number, id: number) => void,
		onFinish?: (dataChannel: RTCDataChannel, id: number) => void,
	) {
		let chunkSize = connection?.sctp?.maxMessageSize;
		if (!chunkSize) chunkSize = 16 * 1024;
		this.sendRTChunked(dataChannel, buffer, chunkSize, id, update, onFinish);
	}

	public sendRTFile(
		file: File,
		dataChannel: RTCDataChannel,
		connection: RTCPeerConnection,
		id: number = 0,
		update?: (byteSend: number, id: number) => void,
	) {
		const bufferCallback = (buffer: ArrayBuffer) => {
			this.sendRT<RTStartOfFile>(dataChannel, { type: "start of file", content: file.name });
			const finishCallback = (dataChannel: RTCDataChannel) =>
				this.sendRT<RTEndOfFile>(dataChannel, { type: "end of file", content: null });
			this.sendRTLarge(dataChannel, buffer, connection, id, update, finishCallback);
		};
		file.arrayBuffer().then(bufferCallback);
	}

	public multicastRTFile(
		file: File,
		connections: { dataChanel: RTCDataChannel; connection: RTCPeerConnection; id: number }[],
		update?: (bytesSend: number, id: number) => void,
	) {
		const bufferCallback = (buffer: ArrayBuffer) => {
			for (let i = 0; i < connections.length; i++) {
				const con = connections[i];
				const dataChannel = con.dataChanel;
				const connection = con.connection;
				this.sendRT<RTStartOfFile>(dataChannel, { type: "start of file", content: file.name });
				const finishCallback = (dataChannel: RTCDataChannel) =>
					this.sendRT<RTEndOfFile>(dataChannel, { type: "end of file", content: null });
				this.sendRTLarge(dataChannel, buffer, connection, con.id, update, finishCallback);
			}
		};
		file.arrayBuffer().then(bufferCallback);
	}
}
