export function commaSeperatedStringToNumberArray(s: string) {
	const sa = s.replace(/[^\d|,]/gi, "").split(",");
	const ar: number[] = [];
	for (const s of sa) ar.push(parseFloat(s));
	return ar;
}

export function objectToUl(win: Window, obj: any): HTMLElement {
	const ul = win.document.createElement("ul");
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === "function") continue;

		const li = win.document.createElement("li");
		if (Array.isArray(value)) {
			li.textContent = `${key}:`;
			const arrayUl = win.document.createElement("ul");
			value.forEach((item) => {
				const arrayLi = win.document.createElement("li");
				if (typeof item === "object" && item !== null) {
					arrayLi.appendChild(objectToUl(win, item));
				} else {
					arrayLi.textContent = item.toString() + ":";
				}
				arrayUl.appendChild(arrayLi);
			});
			li.appendChild(arrayUl);
		} else if (typeof value === "object" && value !== null) {
			li.textContent = `${key}:`;
			li.appendChild(objectToUl(win, value));
		} else {
			li.textContent = `${key}: ${value}`;
		}
		ul.appendChild(li);
	}
	return ul;
}

/**
 * The button property as described by https://www.w3.org/TR/pointerevents/#the-buttons-property
 */
export class PointerButtons {
	/**
	 * Button 1, Primary mouse button, touch contact, pen contact.
	 */
	public static get PRIMARY() {
		return 1;
	}
	/**
	 * Button 2, Secondary mouse button, pen barrel button
	 */
	public static get SECONDARY() {
		return 2;
	}
	/**
	 * Button 3, Middle mouse button.
	 */
	public static get MIDDEL() {
		return 4;
	}
	/**
	 * Button 4, X1 mouse (back)
	 */
	public static get BACK() {
		return 8;
	}
	/**
	 * BUtton 5, X2 mouse (forward)
	 */
	public static get FORWARD() {
		return 16;
	}
	/**
	 * Pen eraser button
	 */
	public static get ERASER() {
		return 32;
	}
}

/**
 * You should use {@link PointerButtons} for named values.
 */
export function isPointerButtonDown(e: PointerEvent, button: number): boolean {
	return (e.buttons & button) > 0;
}

export function isNoPointerButtonDown(e: PointerEvent): boolean {
	return e.buttons === 0;
}
