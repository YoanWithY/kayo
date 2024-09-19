import { WSRole, WSLeaderReady, Identity, WSServerIceCandidateMessage, WSServerRTCOfferMessage, WSClientIceCandidate, RTString } from "../../../../shared/messageTypes";
import { Role } from "./Role";
import { multicastRT, multicastRTFile, sendWS } from "./utils";

export class Leader extends Role {
	public readonly wsRole: WSRole = "Leader";
	public readonly connectionsMap: Map<number, RTCPeerConnection> = new Map();
	public readonly datachannelMap: Map<number, RTCDataChannel> = new Map();
	public readonly progressMap: Map<number, { progress: HTMLProgressElement, text: HTMLParagraphElement }> = new Map();
	private fileInput!: HTMLInputElement;

	public answerRoleIsReady(): void {
		const uploadButton = document.createElement('button');
		uploadButton.id = 'uploadButton';
		uploadButton.textContent = 'Upload File';

		const sendButton = document.createElement("button");
		sendButton.textContent = "Send";
		sendButton.onclick = () => { multicastRT<RTString>(this.datachannelMap.values() as unknown as RTCDataChannel[], { type: "string", content: "send" }) };


		// Create hidden file input
		this.fileInput = document.createElement('input');
		this.fileInput.type = 'file';
		this.fileInput.id = 'fileInput';
		this.fileInput.style.display = 'none';
		document.body.appendChild(uploadButton);
		document.body.appendChild(sendButton);
		document.body.appendChild(this.fileInput);
		const headline = document.createElement("h2");
		headline.textContent = "Users:";
		document.body.appendChild(headline);
		uploadButton.addEventListener('click', () => {
			this.fileInput?.click();
		});

		this.fileInput.addEventListener('change', (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];

			if (file) {
				const con: { dataChanel: RTCDataChannel; connection: RTCPeerConnection; id: number }[] = [];
				for (let [key, value] of this.connectionsMap) {
					if (key === 0)
						continue;

					const channel = this.datachannelMap.get(key);
					if (channel)
						con.push({ connection: value, dataChanel: channel, id: key });
				}
				const start = Date.now();
				multicastRTFile(file, con, (bytesSend: number, id: number) => {
					const prog = this.progressMap.get(id);
					if (!prog)
						return;
					const percent = Math.round(bytesSend / file.size * 100);
					prog.progress.value = percent;
					prog.text.textContent = `To ID ${id}: ${percent}% | ${(bytesSend / (Date.now() - start) / 1000).toFixed(1)} MB/s`;
				})
				// sendWSFile(file, "All but Me", (bytesSend) => {
				// 	console.log(bytesSend / file.size);
				// });
			}
		});

		sendWS<WSLeaderReady>({ type: "leader ready", content: null });
	}

	public async acceptOffer(offer: RTCSessionDescription, originIdentity: Identity) {
		console.log("Leader accepts offer of", originIdentity);
		const followerConnection = this.connectionsMap.get(originIdentity.id);
		if (!followerConnection) {
			console.error("Unknown follower", originIdentity, ". Map is:", this.connectionsMap);
			return;
		}
		await followerConnection.setRemoteDescription(offer);

		const dataChannel = this.datachannelMap.get(originIdentity.id);
		if (!dataChannel) {
			console.error("Unknown Data channel.");
			return;
		}
	}

	public newFollower(identity: Identity) {
		const peerConnection = new RTCPeerConnection();
		const dataChannel = peerConnection.createDataChannel('fileTransfer');

		peerConnection.oniceconnectionstatechange = (e) => {
			console.log("ICE connection state to", JSON.stringify(identity), "change:", e);
		};

		dataChannel.onopen = () => {
			console.log("Data Channel to", identity, "opend.");

			const progress = document.createElement("progress");
			progress.value = 0;
			progress.max = 100;
			const text = document.createElement("p");
			text.textContent = `To ID ${identity.id}:`;
			this.progressMap.set(identity.id, { progress, text });
			document.body.appendChild(text);
			document.body.appendChild(progress);

		};

		dataChannel.onmessage = (event: MessageEvent) => {
			console.log(event.data);
		};

		peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			sendWS<WSServerIceCandidateMessage>({
				type: "ice candidate",
				content: {
					targetIdentity: identity,
					candidate: event.candidate
				}
			});
		};

		this.connectionsMap.set(identity.id, peerConnection);
		this.datachannelMap.set(identity.id, dataChannel);

		peerConnection.createOffer().then((offerInit: RTCSessionDescriptionInit) => {
			return peerConnection.setLocalDescription(offerInit);
		}).then(() => {
			const description = peerConnection.localDescription;
			if (!description) {
				console.error("Description is null.");
				return;
			}
			console.log(peerConnection.localDescription.sdp);
			sendWS<WSServerRTCOfferMessage>({
				type: "offer",
				content: {
					targetIdentity: identity, offer: description
				}
			});
		}).catch((error: Error) => {
			console.error(error);
		});
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
}
