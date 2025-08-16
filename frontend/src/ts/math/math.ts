export function toDEG(RAD: number) {
	return RAD * 57.29577951308232;
}

export function toRAD(DEG: number) {
	return DEG * 0.017453292519943295;
}

export function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, min), max);
}

export function linearStep(x: number, start: number, end: number) {
	return clamp((x - start) / (end - start), 0, 1);
}
