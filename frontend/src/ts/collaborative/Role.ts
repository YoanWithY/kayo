import { Identity, WSClientIceCandidate, WSRole } from "../../../../shared/messageTypes";
import { PTPBase } from "./PTPBase";
import { PTPMessage } from "./PTPChatPannel";

export abstract class Role {
	protected base: PTPBase;
	public readonly id;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public abstract acceptOffer(offer: RTCSessionDescription, identity: Identity): Promise<void>;
	public abstract addIceCandidate(wsICECandidate: WSClientIceCandidate): void;
	private messageListener: Set<(value: string) => void>;
	public constructor(ptpBase: PTPBase, id: number) {
		this.base = ptpBase;
		this.id = id;
		this.messageListener = new Set();
	}

	public abstract sendMessage(value: PTPMessage): void;

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
