import {
	WSRole,
	WSLeaderReady,
	Identity,
	WSClientIceCandidate,
	RTMessage,
	RTString,
} from "../../../../shared/messageTypes";
import { PTPMessage } from "./PTPChatPannel";
import { Role } from "./Role";

export class Leader extends Role {
	public readonly wsRole: WSRole = "Leader";
	public readonly connectionsMap: Map<number, RTCPeerConnection> = new Map();
	public readonly datachannelMap: Map<number, RTCDataChannel> = new Map();
	public readonly progressMap: Map<number, { progress: HTMLProgressElement; text: HTMLParagraphElement }> = new Map();

	public answerRoleIsReady(): void {
		this.ptpx.sendWS<WSLeaderReady>({ type: "leader ready", content: null });
	}

	public acceptOffer(offer: RTCSessionDescription, identity: Identity) {
		const followerConnection = this.connectionsMap.get(identity.id);
		if (!followerConnection) {
			console.error("Unknown follower", identity, ". Map is:", this.connectionsMap);
			return;
		}
		followerConnection.setRemoteDescription(offer);

		if (offer.type == "offer")
			this.answerToOffer(followerConnection, identity);

	}

	public newFollower(identity: Identity) {
		const peerConnection = new RTCPeerConnection();
		this.connectionsMap.set(identity.id, peerConnection);

		const dataChannel = peerConnection.createDataChannel("fileTransfer");
		this.datachannelMap.set(identity.id, dataChannel);
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
	}

	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		const connection = this.connectionsMap.get(wsICECandidate.originIdentity.id);
		if (!connection) {
			console.error("No connection to", wsICECandidate.originIdentity, "is known.");
			return;
		}
		connection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}

	public sendMessage(value: PTPMessage): void {
		this.ptpx.multicastRT<RTString>(Array.from(this.datachannelMap.values()), {
			type: "string",
			content: JSON.stringify(value),
		});
	}
}
