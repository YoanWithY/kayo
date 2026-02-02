import { Kayo } from "../../Kayo";
import { Project } from "../../project/Project";
import { ViewportPane } from "./ViewportPane";

function randomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const randomIterator = () => chars[Math.floor(Math.random() * chars.length)];
	return Array.from({ length }, randomIterator).join("");
}

export class SplashScreen extends HTMLElement {
	private _win!: Window;
	private _container!: HTMLDivElement;
	private _kayoLoadingScreen!: HTMLDivElement;
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

	public static createUIElement(win: Window, kayo: Kayo, kayoLoadingScreen: HTMLDivElement) {
		const p = win.document.createElement(this.getDomClass()) as SplashScreen;
		p._win = win;
		p._kayoLoadingScreen = kayoLoadingScreen;

		const container = win.document.createElement("div");
		container.classList.add("splashScreenContainer");
		p.appendChild(container);

		const h1 = win.document.createElement("h1");
		h1.textContent = "Welcome to Kayo";
		container.append(h1);

		const h2_1 = win.document.createElement("h2");
		h2_1.textContent = "Open Project";
		container.append(h2_1);

		const newProjectButton = win.document.createElement("button");
		newProjectButton.textContent = "New Project";
		const newProjectCallback = () => {
			win.document.body.appendChild(p._kayoLoadingScreen);
			win.document.body.removeChild(p);
			const project = new Project(kayo, randomString(12));
			const projectOpenedCallback = () => {
				kayo.registerProjectOnWindow(win, ViewportPane.getName(), true);
				win.document.body.removeChild(p._kayoLoadingScreen);
			};
			kayo.openProject(project, projectOpenedCallback);
		}
		newProjectButton.addEventListener("click", newProjectCallback);
		container.append(newProjectButton)

		const h2_3 = win.document.createElement("h2");
		h2_1.textContent = "Join Project";
		container.append(h2_3);

		const wrapper1 = win.document.createElement("div");
		wrapper1.classList.add("splashEntryTable");
		container.append(wrapper1);

		const h2_2 = win.document.createElement("h2");
		h2_2.textContent = "Unsaved Projects";
		container.append(h2_2);

		const wrapper2 = win.document.createElement("div");
		container.append(wrapper2);

		p._container = container;
		return p;
	}

	public static getDomClass(): string {
		return "splash-screen";
	}
}
