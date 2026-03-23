
import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./SplashScreen.css?inline";

export class SplashScreen extends HTMLElement {
	public win!: Window;
}

export class SplashScreenBuilder extends UIElementBuilder<KayoAPI, SplashScreen> {
	protected _domClassName = "splash-screen";

	protected get _domClass(): CustomElementConstructor {
		return SplashScreen;
	}

	public build(_: any) {
		const splashScreen = this.createElement<SplashScreen>(this._domClassName);
		splashScreen.win = this.windowUIBuilder.window;

		const container = this.createElement<HTMLDivElement>("div");
		container.classList.add("splashScreenContainer");
		splashScreen.appendChild(container);

		const h1 = this.createElement<HTMLHeadingElement>("h1");
		h1.textContent = "Welcome to Kayo";
		container.appendChild(h1);

		const h2_1 = this.createElement<HTMLHeadElement>("h2");
		h2_1.textContent = "New Project";
		container.appendChild(h2_1);

		const newProjectButton = this.createElement<HTMLButtonElement>("button");
		newProjectButton.textContent = "New Project";
		const newProjectCallback = () => {
			this.windowUIBuilder.IOAPI.openProject();
		}
		newProjectButton.addEventListener("click", newProjectCallback);
		container.append(newProjectButton)

		const h2_3 = this.createElement<HTMLHeadingElement>("h2");
		h2_3.textContent = "Join Project";
		container.appendChild(h2_3);
		const input = this.createElement<HTMLInputElement>("input");
		input.type = "password";
		input.autocomplete = "off";
		container.appendChild(input);
		const inputButton = this.createElement<HTMLButtonElement>("button");
		inputButton.textContent = "Join";
		const joinProjectCallback = () => {
			// const id = input.value;
			// win.document.body.appendChild(p._kayoLoadingScreen);
			// win.document.body.removeChild(p);

			// const ptpx = new PTPX();
			// const projectOpenedCallback = () => {
			// 	kayoAPI.registerProjectOnWindow(win, ViewportPane.getName(), true);
			// 	win.document.body.removeChild(p._kayoLoadingScreen);
			// };
			// const onSucess = () => {
			// 	const project = new Project(kayoAPI, id);
			// 	kayoAPI.openProject(project, projectOpenedCallback)
			// 	project.initPTP(ptpx);
			// };
			// const onError = () => {

			// };
			// ptpx.connect(id, onSucess, onError);
		};
		inputButton.addEventListener("click", joinProjectCallback);
		container.appendChild(inputButton);

		const wrapper1 = this.createElement<HTMLDivElement>("div");
		wrapper1.classList.add("splashEntryTable");
		container.appendChild(wrapper1);

		const h2_2 = this.createElement<HTMLHeadingElement>("h2");
		h2_2.textContent = "Unsaved Projects";
		container.appendChild(h2_2);

		const wrapper2 = this.createElement<HTMLDivElement>("div");
		container.appendChild(wrapper2);

		return splashScreen;
	}

	public _initWindowComponentStyles(): void {
		this.addStyle(css);
	}

}
