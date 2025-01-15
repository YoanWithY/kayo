import { Identity, WSClientIceCandidate, WSRole } from "../../../../shared/messageTypes";
import { PTPBase } from "./PTPBase";

export abstract class Role {
	protected base: PTPBase;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public abstract acceptOffer(offer: RTCSessionDescription, identity: Identity): Promise<void>;
	public abstract addIceCandidate(wsICECandidate: WSClientIceCandidate): void;
	private messageListener: Set<(value: string) => void>;
	constructor(ptpBase: PTPBase) {
		this.base = ptpBase;
		this.messageListener = new Set();
	}

	public abstract sendMessage(value: string): void;

	public addMessageListener(callback: (value: string) => void) {
		this.messageListener.add(callback);
	}

	public removeMessageCallback(callback: (value: string) => void) {
		this.messageListener.delete(callback);
	}

	public dispatchMessage(value: string): void {
		this.messageListener.forEach((c) => c(value));
	}
}

