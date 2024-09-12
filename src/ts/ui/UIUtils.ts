export function commaSeperatedStringToNumberArray(s: string) {
	const sa = s.replace(/[^\d|,]/ig, "").split(",");
	const ar: number[] = [];
	for (let s of sa)
		ar.push(parseFloat(s));
	return ar;
}

export function createSpan(text: string): HTMLSpanElement {
	const span = document.createElement("span");
	span.textContent = text;
	return span;
}

export function createPre(text: string): HTMLPreElement {
	const pre = document.createElement("pre");
	pre.textContent = text;
	return pre;
}