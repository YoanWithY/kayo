import {
	WSRole,
	WSFollowerReady,
	Identity,
	WSServerIceCandidateMessage,
	WSServerRTCOfferMessage,
	WSClientIceCandidate,
	RTMessage,
	RTString,
} from "../../../../shared/messageTypes";
import { PTPBase } from "./PTPBase";
import { PTPMessage } from "./PTPChatPannel";
import { Role } from "./Role";

export class Follower extends Role {
	public readonly wsRole: WSRole = "Follower";
	public readonly leaderConnection = new RTCPeerConnection();

	public dataChannel!: RTCDataChannel;
	public constructor(ptpBase: PTPBase, id: number) {
		super(ptpBase, id);

		this.leaderConnection.ondatachannel = (event: RTCDataChannelEvent) => {
			this.dataChannel = event.channel;

			this.dataChannel.onopen = () => {
				console.log("Data Channel to leader connected.");
			};

			let pendingFilename = "";
			const dataArr: ArrayBuffer[] = [];

			this.dataChannel.onmessage = (event: MessageEvent) => {
				if (typeof event.data === "string") {
					const message = JSON.parse(event.data) as RTMessage;
					switch (message.type) {
						case "start of file": {
							pendingFilename = message.content;
							break;
						}

						case "end of file": {
							const receivedBlob = new Blob(dataArr);
							const downloadLink = document.createElement("a");
							downloadLink.href = URL.createObjectURL(receivedBlob);
							downloadLink.download = pendingFilename; // Set the filename here

							// Automatically trigger the download
							downloadLink.click();
							dataArr.length = 0;
							break;
						}

						case "string": {
							this.dispatchMessage(message.content);
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
		this.base.sendWS<WSFollowerReady>({ type: "follower ready", content: null });
	}

	public async acceptOffer(offer: RTCSessionDescription, identity: Identity) {
		console.log("Follower accepts offer of", identity);
		this.leaderConnection.oniceconnectionstatechange = (e) => {
			console.log("ICE connection state change:", e);
		};
		this.leaderConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
			this.base.sendWS<WSServerIceCandidateMessage>({
				type: "ice candidate",
				content: {
					targetIdentity: identity,
					candidate: event.candidate,
				},
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
		this.base.sendWS<WSServerRTCOfferMessage>({
			type: "offer",
			content: {
				targetIdentity: { id: 0, origin: undefined },
				offer: backOffer,
			},
		});
	}
	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		this.leaderConnection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}

	public sendMessage(value: PTPMessage): void {
		this.base.sendRT<RTString>(this.dataChannel, { type: "string", content: JSON.stringify(value) });
	}
}
