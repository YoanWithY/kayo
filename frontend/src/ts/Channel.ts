import { GUID } from "./IDGenerator";

export type CMType = "ui";
export type CMUIOperationType = "toggle boolean" | "set select";
export type CMObject = { type: CMType };

export type UIBindCM = CMObject & { type: "ui bind", context: number, sourceComponent: GUID, targetVariable: GUID };
export type UIUnbindCM = CMObject & { type: "ui unbind", sourceComponent: GUID, targetVariable: GUID };
export type UIMessageObjectCM = CMObject & { type: "ui", operation: CMUIOperationType, targetVariable: GUID };
export type UIToggleBooleanCM = UIMessageObjectCM & { operation: "toggle boolean" }
export type UISetSelectCM = UIMessageObjectCM & { operation: "set select", value: string | number };

export class ChannelToMain {
	private _fromContextID: number
	channel: BroadcastChannel

	static getChannelName(localContextID: number) {
		return `kayo sub ${localContextID} to main`;
	}

	constructor(localContextID: number) {
		this._fromContextID = localContextID;
		this.channel = new BroadcastChannel(ChannelToMain.getChannelName(this._fromContextID));
	}

	postUIToggleBoolean(booleanStateVaribaleGUID: GUID) {
		const msg: UIToggleBooleanCM = { type: "ui", operation: "toggle boolean", targetVariable: booleanStateVaribaleGUID };
		this.channel.postMessage(msg)
	}

	postUISetSelect(selectStateVaribaleGUID: GUID, value: string | number) {
		const msg: UISetSelectCM = { type: "ui", operation: "set select", targetVariable: selectStateVaribaleGUID, value: value }
		this.channel.postMessage(msg);
	}
}

export class ChannelFromMain {
	private _toContextID: number
	channel: BroadcastChannel

	static getChannelName(localContextID: number) {
		return `kayo main to sub ${localContextID}`;
	}

	constructor(localContextID: number) {
		this._toContextID = localContextID;
		this.channel = new BroadcastChannel(ChannelFromMain.getChannelName(this._toContextID));
	}
}