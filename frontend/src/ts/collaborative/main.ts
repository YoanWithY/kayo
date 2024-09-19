import { Identity, WSClientMessageType, WSClientMessage, WSRole, WSClientOffer, WSClientIceCandidate, WSClientFileInfo } from "../../../../shared/messageTypes";
import { Role } from "./Role";
import { Follower } from "./Follower";
import { Leader } from "./Leader";

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const hostname = window.location.hostname;
const wsPort = 81;
const wsUrl = `${protocol}//${hostname}:${wsPort}`;
let role: Role;
export const ws = new WebSocket(wsUrl);
ws.binaryType = 'arraybuffer';

let pendingFilename = "";
const dataArr: any[] | undefined = [];
ws.onmessage = async (event: MessageEvent) => {
	if (typeof event.data === "string") {
		const message = JSON.parse(event.data) as WSClientMessage;
		console.log("WS Recevied: ", message);
		const func = funcMap[message.type];
		func(message.content);
	} else {
		dataArr.push(event.data);
	}

};

const funcMap: { [K in WSClientMessageType]: (content: any) => void } = {

	"offer": (content: any) => {
		const wsOffer = content as WSClientOffer;
		role.acceptOffer(wsOffer.offer, wsOffer.originIdentity);
	},

	"string": (content: any) => {
		console.log(content);
	},

	"role assignment": (content: any) => {
		role = (content as WSRole) == "Follower" ? new Follower(ws) : new Leader(ws);
		role.answerRoleIsReady();
	},

	"new follower": (content: any) => {
		(role as Leader).newFollower(content as Identity);
	},

	"ice candidate": (content: any) => {
		role.addIceCandidate((content as WSClientIceCandidate));
	},

	"start of file": (content: any) => {
		const c = content as WSClientFileInfo;
		pendingFilename = c.fileName;
	},

	"end of file": (content: any) => {
		console.log(content);
		const receivedBlob = new Blob(dataArr);
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(receivedBlob);
		downloadLink.download = pendingFilename;
		downloadLink.click();
		dataArr.length = 0;
	}
};