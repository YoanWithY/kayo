import { Kayo } from "./Kayo";

export type PubID = number;

let pubID = 0;
export function allocPubID(): PubID {
	return pubID++;
}

export function dispatchValue(pubID: number, value: any) {
	((window as any).kayo as Kayo).project.dispatchValueToSubscribers(pubID, value);
}
