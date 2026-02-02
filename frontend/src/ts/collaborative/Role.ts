import { Identity, WSClientIceCandidate, WSRole } from "../../../../shared/messageTypes";
import { PTPX } from "./PTPX";
import { PTPMessage } from "./PTPChatPannel";

export abstract class Role {
	protected ptpx: PTPX;
	public readonly id;
	public abstract readonly wsRole: WSRole;
	public abstract answerRoleIsReady(): void;
	public abstract acceptOffer(offer: RTCSessionDescription, identity: Identity): Promise<void>;
	public abstract addIceCandidate(wsICECandidate: WSClientIceCandidate): void;
	private messageListener: Set<(value: string) => void>;
	public constructor(ptpBase: PTPX, id: number) {
		this.ptpx = ptpBase;
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
		for (const c of this.messageListener) c(value);
	}
}
