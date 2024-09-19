import { Identity, WSClientIceCandidate, WSRole } from "../../../../shared/messageTypes";

export abstract class Role {
	protected ws: WebSocket;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public abstract acceptOffer(offer: RTCSessionDescription, identity: Identity): Promise<void>;
	public abstract addIceCandidate(wsICECandidate: WSClientIceCandidate): void;
	constructor(ws: WebSocket) {
		this.ws = ws;
	}
}

