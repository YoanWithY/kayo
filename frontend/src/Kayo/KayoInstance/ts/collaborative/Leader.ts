import {
	WSRole,
	WSLeaderReady,
	Identity,
	RTMessage,
} from "../../../../../../shared/messageTypes";
import { Peer } from "./Peer";
import { iceServers, Role } from "./Role";

export class Leader extends Role {
	public readonly wsRole: WSRole = "Leader";
	public readonly progressMap: Map<number, { progress: HTMLProgressElement; text: HTMLParagraphElement }> = new Map();

	public answerRoleIsReady(): void {
		this.ptpx.sendWS<WSLeaderReady>({ type: "leader ready", content: null });
	}

	public newFollower(identity: Identity) {
		const peerConnection = new RTCPeerConnection({ iceServers });
		const dataChannel = peerConnection.createDataChannel("fileTransfer");
		dataChannel.onopen = () => {
			console.log("Opened Channel:", dataChannel);
		};

		dataChannel.onmessage = (event: MessageEvent) => {
			if (typeof event.data === "string") {
				const message = JSON.parse(event.data) as RTMessage;
				switch (message.type) {
					case "string": {
						this.dispatchMessage(message.content);
						break;
					}
				}
			}
		};

		this.initializeConnection(peerConnection, identity);
		this.ptpx.trackLog.prepConnection(peerConnection, identity);
		const peer = new Peer(identity.id, peerConnection, dataChannel);
		this.peers.set(identity.id, peer);
		return peer;
	}
}
