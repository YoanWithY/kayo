export function getElement<T>(iterable: Iterable<T>, index: number): T | undefined {
	let i = 0;
	for (const val of iterable) {
		if (i === index) return val;
		i++;
	}
	return undefined;
}
