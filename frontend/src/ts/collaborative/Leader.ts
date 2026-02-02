import {
	WSRole,
	WSLeaderReady,
	Identity,
	WSServerIceCandidateMessage,
	WSServerRTCOfferMessage,
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

	public async acceptOffer(offer: RTCSessionDescription, originIdentity: Identity) {
		console.log("Leader accepts offer of", originIdentity);
		const followerConnection = this.connectionsMap.get(originIdentity.id);
		if (!followerConnection) {
			console.error("Unknown follower", originIdentity, ". Map is:", this.connectionsMap);
			return;
		}
		// eslint-disable-next-line local/no-await
		await followerConnection.setRemoteDescription(offer);

		const dataChannel = this.datachannelMap.get(originIdentity.id);
		if (!dataChannel) {
			console.error("Unknown Data channel.");
			return;
		}
	}

	public newFollower(identity: Identity) {
		const peerConnection = new RTCPeerConnection();


		peerConnection.oniceconnectionstatechange = (e) => {
			console.log("ICE connection state to", JSON.stringify(identity), "change:", e);
		};

		peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			this.ptpx.sendWS<WSServerIceCandidateMessage>({
				type: "ice candidate",
				content: {
					targetIdentity: identity,
					candidate: event.candidate,
				},
			});
		};

		this.connectionsMap.set(identity.id, peerConnection);
		const offerCallback = (offerInit: RTCSessionDescriptionInit) => {
			return peerConnection.setLocalDescription(offerInit);
		};
		const descriptionCallback = () => {
			const description = peerConnection.localDescription;
			if (!description) {
				console.error("Description is null.");
				return;
			}
			this.ptpx.sendWS<WSServerRTCOfferMessage>({
				type: "offer",
				content: {
					targetIdentity: identity,
					offer: description,
				},
			});
		};
		const errorCallback = (error: Error) => {
			console.error(error);
		};
		peerConnection.onnegotiationneeded = () => {
			peerConnection.createOffer().then(offerCallback).then(descriptionCallback).catch(errorCallback);
		}

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
	}

	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		const connection = this.connectionsMap.get(wsICECandidate.originIdentity.id);
		if (!connection) {
			console.error("No connection to", wsICECandidate.originIdentity, "is known.");
			return;
		}
		console.log(wsICECandidate.candidate?.candidate);
		connection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}

	public sendMessage(value: PTPMessage): void {
		this.ptpx.multicastRT<RTString>(Array.from(this.datachannelMap.values()), {
			type: "string",
			content: JSON.stringify(value),
		});
	}
}
