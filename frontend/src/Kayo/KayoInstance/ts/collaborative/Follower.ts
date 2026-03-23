import {
	WSRole,
	WSFollowerReady,
	Identity,
	RTMessage,
} from "../../../../../../shared/messageTypes";
import { Peer } from "./Peer";
import { PTPX } from "./PTPX";
import { iceServers, Role } from "./Role";

export class Follower extends Role {
	public readonly wsRole: WSRole = "Follower";
	private _leaderIdentity: Identity


	public constructor(ptpBase: PTPX, id: number, leaderIdentity: Identity) {
		super(ptpBase, id);
		this._leaderIdentity = leaderIdentity;
		const leaderConnection = new RTCPeerConnection({ iceServers });

		leaderConnection.ondatachannel = (event: RTCDataChannelEvent) => {
			const dataChannel = event.channel;

			dataChannel.onopen = () => {
				console.log("Data Channel to leader connected.");
			};

			let pendingFilename = "";
			const dataArr: ArrayBuffer[] = [];

			dataChannel.onmessage = (event: MessageEvent) => {
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
		this.initializeConnection(leaderConnection, leaderIdentity);
		this.ptpx.trackLog.prepConnection(leaderConnection, leaderIdentity);
		const leaderPeer = new Peer(leaderIdentity.id, leaderConnection);
		this.peers.set(leaderIdentity.id, leaderPeer);
	}
	public answerRoleIsReady(): void {
		this.ptpx.sendWS<WSFollowerReady>({ type: "follower ready", content: null });
	}
}
