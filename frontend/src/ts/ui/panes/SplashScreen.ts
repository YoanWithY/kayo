import { Kayo } from "../../Kayo";

export class SplashScreen extends HTMLElement {
	private _win!: Window;
	private _container!: HTMLDivElement;
	private _propCancelCallback = (e: MouseEvent) => {
		e.stopPropagation();
	};
	private _removeSplashCallback = () => {
		this._win.document.body.removeChild(this);
	};

	protected connectedCallback() {
		this._container.addEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.addEventListener("pointerdown", this._removeSplashCallback);
	}

	protected disconnectedCallback() {
		this._container.removeEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.removeEventListener("pointerdown", this._removeSplashCallback);
	}

	public static createUIElement(win: Window, _: Kayo) {
		const p = win.document.createElement(this.getDomClass()) as SplashScreen;

		const container = win.document.createElement("div");
		container.classList.add("splashScreenContainer");
		p.appendChild(container);

		const h1 = win.document.createElement("h1");
		h1.textContent = "Welcome to Kayo";
		container.append(h1);

		const h2_1 = win.document.createElement("h2");
		h2_1.textContent = "Open Project";
		container.append(h2_1);

		const wrapper1 = win.document.createElement("div");
		wrapper1.classList.add("splashEntryTable");
		container.append(wrapper1);

		const h2_2 = win.document.createElement("h2");
		h2_2.textContent = "Unsaved Projects";
		container.append(h2_2);

		const wrapper2 = win.document.createElement("div");
		container.append(wrapper2);

		p._win = win;
		p._container = container;
		return p;
	}

	public static getDomClass(): string {
		return "splash-screen";
	}
}
