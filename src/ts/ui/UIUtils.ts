export function commaSeperatedStringToNumberArray(s: string) {
	const sa = s.replace(/[^\d|,]/ig, "").split(",");
	const ar: number[] = [];
	for (let s of sa)
		ar.push(parseFloat(s));
	return ar;
}