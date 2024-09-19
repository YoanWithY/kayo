import { WSRole, WSFollowerReady, Identity, WSServerIceCandidateMessage, WSServerRTCOfferMessage, WSClientIceCandidate, RTMessage } from "../../../../shared/messageTypes";
import { Role } from "./Role";
import { sendWS } from "./utils";

export class Follower extends Role {
	public readonly wsRole: WSRole = "Follower";
	public readonly leaderConnection = new RTCPeerConnection();
	public constructor(ws: WebSocket) {
		super(ws);

		this.leaderConnection.ondatachannel = (event: RTCDataChannelEvent) => {

			const dataChannel = event.channel;

			dataChannel.onopen = () => {
				console.log("Data Channel to leader connected.");
			};

			let pendingFilename = "";
			const dataArr: ArrayBuffer[] = [];

			dataChannel.onmessage = (event: MessageEvent) => {

				if (typeof event.data === "string") {
					const message = JSON.parse(event.data) as RTMessage;
					const text = document.createElement("p");
					text.innerText = "RT: " + message.content;
					document.body.appendChild(text);
					switch (message.type) {

						case "start of file": {
							pendingFilename = message.content;
							break;
						}

						case "end of file": {
							const receivedBlob = new Blob(dataArr);
							const downloadLink = document.createElement('a');
							downloadLink.href = URL.createObjectURL(receivedBlob);
							downloadLink.download = pendingFilename; // Set the filename here

							// Automatically trigger the download
							downloadLink.click();
							dataArr.length = 0;
							break;
						}

						case "string": {
							console.log(message.content);
							break;
						}
					}
				} else if (event.data instanceof ArrayBuffer) {
					dataArr.push(event.data);
				}
			};
		};


	}
	public answerRoleIsReady(): void {
		sendWS<WSFollowerReady>({ type: "follower ready", content: null });
	}

	public async acceptOffer(offer: RTCSessionDescription, identity: Identity) {
		console.log("Follower accepts offer of", identity);
		this.leaderConnection.oniceconnectionstatechange = (e) => {
			console.log("ICE connection state change:", e);
		};
		this.leaderConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			sendWS<WSServerIceCandidateMessage>({
				type: "ice candidate",
				content: {
					targetIdentity: identity,
					candidate: event.candidate
				}
			});
		};

		await this.leaderConnection.setRemoteDescription(offer);

		const answer = await this.leaderConnection.createAnswer();
		await this.leaderConnection.setLocalDescription(answer);
		const backOffer = this.leaderConnection.localDescription;
		if (!backOffer) {
			console.error("Description is null.");
			return;
		}
		sendWS<WSServerRTCOfferMessage>({
			type: "offer",
			content: {
				targetIdentity: { id: 0, origin: undefined },
				offer: backOffer
			}
		});
	}
	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		this.leaderConnection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}
}
