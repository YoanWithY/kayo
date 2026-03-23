import { Identity, WSClientIceCandidate, WSRole, WSServerIceCandidateMessage, WSServerRTCOfferMessage } from "../../../../../../shared/messageTypes";
import { Peer } from "./Peer";
import { PTPX } from "./PTPX";

export const iceServers = [
	{ urls: "stun:stun.l.google.com:19302" },
	{ urls: "stun:stun.l.google.com:5349" },
	{ urls: "stun:stun1.l.google.com:3478" },
	{ urls: "stun:stun1.l.google.com:5349" },
	{ urls: "stun:stun2.l.google.com:19302" },
	{ urls: "stun:stun2.l.google.com:5349" },
	{ urls: "stun:stun3.l.google.com:3478" },
	{ urls: "stun:stun3.l.google.com:5349" },
	{ urls: "stun:stun4.l.google.com:19302" },
	{ urls: "stun:stun4.l.google.com:5349" }];

export abstract class Role {
	protected ptpx: PTPX;
	public readonly id;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public readonly peers: Map<number, Peer> = new Map();
	private messageListener: Set<(value: string) => void>;
	public constructor(ptpx: PTPX, id: number) {
		this.ptpx = ptpx;
		this.id = id;
		this.messageListener = new Set();
	}

	public addMessageListener(callback: (value: string) => void) {
		this.messageListener.add(callback);
	}

	public removeMessageCallback(callback: (value: string) => void) {
		this.messageListener.delete(callback);
	}

	public dispatchMessage(value: string): void {
		for (const c of this.messageListener) c(value);
	}

	protected initializeConnection(peerConnection: RTCPeerConnection, targetIdentity: Identity) {
		peerConnection.oniceconnectionstatechange = (e) => {
			console.log("ICE connection state to", JSON.stringify(targetIdentity), "change:", e);
		};

		peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			this.ptpx.sendWS<WSServerIceCandidateMessage>({
				type: "ice candidate",
				content: {
					targetIdentity: targetIdentity,
					candidate: event.candidate,
				},
			});
		};

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
					targetIdentity: targetIdentity,
					offer: description,
				},
			});
		};

		const errorCallback = (error: Error) => {
			console.error(error);
		};

		peerConnection.onnegotiationneeded = () => {
			console.log("Negotiation Needed");
			peerConnection.createOffer().then(offerCallback).then(descriptionCallback).catch(errorCallback);
		}
	}

	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		const peer = this.peers.get(wsICECandidate.originIdentity.id);
		if (!peer) {
			console.error("No connection to", wsICECandidate.originIdentity, "is known.");
			return;
		}
		peer.connection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}

	public acceptOffer(offer: RTCSessionDescription, identity: Identity) {
		console.log("accept", offer);
		const peer = this.peers.get(identity.id);
		if (!peer) {
			console.error("Unknown follower", identity, ". Map is:", this.peers);
			return;
		}
		peer.connection.setRemoteDescription(offer);

		if (offer.type == "offer")
			this.answerToOffer(peer.connection, identity);
	}

	protected answerToOffer(peerConnection: RTCPeerConnection, targetIdentity: Identity) {
		const answerCallback = (answer: RTCSessionDescriptionInit) => {
			const localCallback = () => {
				const backOffer = peerConnection.localDescription;
				if (!backOffer) {
					console.error("Description is null.");
					return;
				}
				this.ptpx.sendWS<WSServerRTCOfferMessage>({
					type: "offer",
					content: {
						targetIdentity: targetIdentity,
						offer: backOffer,
					},
				});
			};
			peerConnection.setLocalDescription(answer).then(localCallback);
		}
		peerConnection.createAnswer().then(answerCallback);
	}
}
