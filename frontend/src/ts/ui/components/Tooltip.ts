export default class Tooltip extends HTMLElement {
	public static createTooltip(win: Window, serialTooltip: SerialTooltip, obj: any): Tooltip {
		const tooltip = win.document.createElement("tool-tip") as Tooltip;
		tooltip.setAttribute("state", "invisible");

		if (serialTooltip.description) {
			const container = win.document.createElement("div");
			container.innerHTML = serialTooltip.description;
			tooltip.appendChild(container);
		}

		if (obj.uneffectiveIfAny) {
			const container = win.document.createElement("div");
			container.style.marginTop = "8px";
			let htmlstring = `<p>Uneffective if${obj.uneffectiveIfAny.length > 1 ? " any of" : ""}</p><ul>`;
			for (const entry of obj.uneffectiveIfAny) {
				htmlstring += `<li><kbd class="api-text">${entry.stateVariableURL} = ${entry.anyOf.toString()}</kbd>`;
			}
			htmlstring += "</ul>";
			container.innerHTML = htmlstring;
			tooltip.appendChild(container);
		}

		if (obj.stateVariableURL) {
			const container = win.document.createElement("div");
			container.style.marginTop = "8px";
			container.innerHTML = `<kbd class="api-text">API: ${obj.stateVariableURL}</kbd>`;
			tooltip.appendChild(container);
		}

		return tooltip;
	}

	public static register(win: Window, tooltipString: SerialTooltip, element: HTMLElement, obj: any) {
		const tooltip = Tooltip.createTooltip(win, tooltipString, obj);
		element.addEventListener("pointerenter", (e) => {
			tooltip.style.left = `${e.clientX}px`;
			tooltip.style.top = `${e.clientY}px`;
			tooltip.setAttribute("state", "visible");
			win.document.body.appendChild(tooltip);
		});

		element.addEventListener("pointerleave", () => {
			tooltip.setAttribute("state", "invisible");
			win.document.body.removeChild(tooltip);
		});
	}
}

export type SerialTooltip = { description?: string; API?: string };
