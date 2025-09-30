export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const debundWrapped = (...args: Parameters<T>): void => {
		if (timeoutId !== null) clearTimeout(timeoutId);
		const deboundTimeoutHandler = () => {
			func(...args);
		};
		timeoutId = setTimeout(deboundTimeoutHandler, wait);
	};
	return debundWrapped;
}

const decoder = new TextDecoder();
export function uint8ArrayToObject(data: Uint8Array): any {
	if (data.length === 0) return undefined;
	try {
		return JSON.parse(decoder.decode(data));
	} catch (e) {
		console.error(e);
	}
	return undefined;
}

export function getWindowZoom(window: Window) {
	return window.outerWidth / window.innerWidth;
}
