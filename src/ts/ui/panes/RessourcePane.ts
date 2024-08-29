import { gpu, gpuAdapter, gpuDevice } from "../../GPUX";

function objectToUl(obj: any): HTMLElement {
	const ul = document.createElement('ul');
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === "function")
			continue;

		const li = document.createElement('li');
		if (Array.isArray(value)) {
			li.textContent = `${key}:`;
			const arrayUl = document.createElement('ul');
			value.forEach(item => {
				const arrayLi = document.createElement('li');
				if (typeof item === 'object' && item !== null) {
					arrayLi.appendChild(objectToUl(item));
				} else {
					arrayLi.textContent = item.toString() + ":";
				}
				arrayUl.appendChild(arrayLi);
			});
			li.appendChild(arrayUl);
		} else if (typeof value === 'object' && value !== null) {
			li.textContent = `${key}:`;
			li.appendChild(objectToUl(value));
		} else {
			li.textContent = `${key}: ${value}`;
		}
		ul.appendChild(li);
	}
	return ul;
}

export default class RessourcePane extends HTMLElement {
	private tree: HTMLElement | null = null;
	private listener = () => {
		if (this.tree)
			this.removeChild(this.tree);
		const obj = {
			"Screen": {
				"Available Width": `${screen.availWidth} pt`,
				"Available Height": `${screen.availHeight} pt`,
				"Width": `${screen.width} pt`,
				"Height": `${screen.height} pt`,
				"Orientation": screen.orientation,
				"Color Depth": screen.colorDepth,
				"Pixel Depth": screen.pixelDepth,
				"Device Pixel Ratio": window.devicePixelRatio,
				"Conclude HDR Support": screen.colorDepth > 24
			},
			"GPU": {
				"Prefered Canvas Format": gpu.getPreferredCanvasFormat(),
				"WGLS Features": Array.from(gpu.wgslLanguageFeatures),
			},
			"GPU Adapter": {
				"Is Fallback Adapter": gpuAdapter.isFallbackAdapter,
				"Info": gpuAdapter.info,
				"Features": Array.from(gpuAdapter.features),
				"Limits": gpuAdapter.limits,
			},
			"GPU Device": {
				"Label": gpuDevice.label,
				"Features": Array.from(gpuDevice.features),
				"Limits": gpuDevice.limits,
			}
		}
		this.tree = objectToUl(obj);
		this.appendChild(this.tree);
	}

	public static createRessourcePane(): RessourcePane {
		return document.createElement("ressource-pane") as RessourcePane;
	}

	connectedCallback() {
		this.listener();
		window.addEventListener("resize", this.listener)
	}

	disconnectedCallback() {
		window.removeEventListener("resize", this.listener);
	}
}