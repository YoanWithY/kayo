export function commaSeperatedStringToNumberArray(s: string) {
	const sa = s.replace(/[^\d|,]/gi, "").split(",");
	const ar: number[] = [];
	for (let s of sa) ar.push(parseFloat(s));
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
