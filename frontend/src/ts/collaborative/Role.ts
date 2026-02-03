import { Identity, WSClientIceCandidate, WSRole, WSServerIceCandidateMessage, WSServerRTCOfferMessage } from "../../../../shared/messageTypes";
import { PTPX } from "./PTPX";

export abstract class Role {
	protected ptpx: PTPX;
	public readonly id;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public abstract acceptOffer(offer: RTCSessionDescription, identity: Identity): void;
	public abstract addIceCandidate(wsICECandidate: WSClientIceCandidate): void;
	private messageListener: Set<(value: string) => void>;
	public constructor(ptpBase: PTPX, id: number) {
		this.ptpx = ptpBase;
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
			peerConnection.createOffer().then(offerCallback).then(descriptionCallback).catch(errorCallback);
		}
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
