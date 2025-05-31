export default class Tooltip extends HTMLElement {
	static createTooltip(win: Window, serialTooltip: SerialTooltip, stateVariableURL?: string): Tooltip {
		const tooltip = win.document.createElement("tool-tip") as Tooltip;
		tooltip.setAttribute("state", "invisible");

		if (serialTooltip.description) {
			const container = win.document.createElement("div");
			container.innerHTML = serialTooltip.description;
			tooltip.appendChild(container);
		}

		if (stateVariableURL) {
			const container = win.document.createElement("div");
			container.style.marginTop = "8px";
			container.innerHTML = `<kbd class="api-text">API: ${stateVariableURL}</kbd>`;
			tooltip.appendChild(container);
		}

		return tooltip;
	}

	static register(win: Window, tooltipString: SerialTooltip, element: HTMLElement, stateVariableURL?: string) {
		const tooltip = Tooltip.createTooltip(win, tooltipString, stateVariableURL);
		element.addEventListener("mouseenter", (e) => {
			tooltip.style.left = `${e.clientX}px`;
			tooltip.style.top = `${e.clientY}px`;
			tooltip.setAttribute("state", "visible");
			win.document.body.appendChild(tooltip);
		});

		element.addEventListener("mouseleave", () => {
			tooltip.setAttribute("state", "invisible");
			document.body.removeChild(tooltip);
		});
	}
}

export type SerialTooltip = { description?: string; API?: string };
