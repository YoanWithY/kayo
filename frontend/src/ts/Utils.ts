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

export function equalByValue(a: any, b: any) {
	if (a === b) return true;

	if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
		return false;
	}

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!equalByValue(a[i], b[i])) return false;
		return true;
	}

	const keysA = Object.keys(a as object);
	const keysB = Object.keys(b as object);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!keysB.includes(key)) return false;
		if (!equalByValue((a as any)[key], (b as any)[key])) return false;
	}

	return true;
}
