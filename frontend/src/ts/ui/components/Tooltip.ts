export default class Tooltip extends HTMLElement {
	static createTooltip(toolTip: HTMLElement): Tooltip {
		const tooltip = document.createElement("tool-tip") as Tooltip;
		tooltip.setAttribute("state", "invisible");
		tooltip.appendChild(toolTip);
		return tooltip;
	}

	static register(tooltip: Tooltip, element: HTMLElement) {
		element.addEventListener("mouseenter", (e) => {
			tooltip.style.left = `${e.clientX}px`;
			tooltip.style.top = `${e.clientY}px`;
			tooltip.setAttribute("state", "visible");
			document.body.appendChild(tooltip);
		});
		element.addEventListener("mouseleave", () => {
			tooltip.setAttribute("state", "invisible");
			document.body.removeChild(tooltip);
		});
	}
}

export interface Tooltipabble<T> {
	setTooltip(tooltip: T): void;
}