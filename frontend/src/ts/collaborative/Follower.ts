import {
	WSRole,
	WSFollowerReady,
	Identity,
	WSClientIceCandidate,
	RTMessage,
} from "../../../../shared/messageTypes";
import { PTPX } from "./PTPX";
import { iceServers, Role } from "./Role";

export class Follower extends Role {
	public readonly wsRole: WSRole = "Follower";
	public readonly leaderConnection;
	private _leaderIdentity: Identity

	public dataChannel!: RTCDataChannel;
	public constructor(ptpBase: PTPX, id: number, leaderIdentity: Identity) {
		super(ptpBase, id);
		this._leaderIdentity = leaderIdentity;
		this.leaderConnection = new RTCPeerConnection({ iceServers });
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
		this.initializeConnection(this.leaderConnection, this._leaderIdentity);
	}
	public answerRoleIsReady(): void {
		this.ptpx.sendWS<WSFollowerReady>({ type: "follower ready", content: null });
	}

	public acceptOffer(offer: RTCSessionDescription, identity: Identity) {
		this.leaderConnection.setRemoteDescription(offer);
		if (offer.type == "offer")
			this.answerToOffer(this.leaderConnection, identity);
	}

	public addIceCandidate(wsICECandidate: WSClientIceCandidate) {
		this.leaderConnection.addIceCandidate(wsICECandidate.candidate ? wsICECandidate.candidate : undefined);
	}

}
