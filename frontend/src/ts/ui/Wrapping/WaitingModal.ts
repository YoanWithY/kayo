import { Kayo } from "../../Kayo";

export default class ProgressModal extends HTMLElement {
	public kayo!: Kayo;
	public modal!: HTMLDivElement;
	public modalContent!: HTMLDivElement;
	public window!: Window;

	public static getDomClass() {
		return "progress-modal";
	}
	public static createUIElement(win: Window, kayo: Kayo, title: string) {
		const p = win.document.createElement(this.getDomClass()) as ProgressModal;
		p.window = win;
		p.kayo = kayo;
		p.modal = win.document.createElement("div");

		const titleElement = win.document.createElement("h1");
		titleElement.textContent = title;
		p.append(titleElement);

		p.modalContent = win.document.createElement("div");
	}

	public setPrgressValue(key: string, value: number, max: number) {
		const progressItem = this.window.document.getElementById(`pm_p_${key}`) as HTMLProgressElement | null;
		if (progressItem) {
			progressItem.value = value;
			progressItem.max = max;
			return;
		}

		const newProgressItem = this.window.document.createElement("div");
		newProgressItem.classList.add("progressItem");

		const progressTitle = this.window.document.createElement("span");
		progressTitle.textContent = key;
		newProgressItem.appendChild(progressTitle);

		const progressBar = this.window.document.createElement("progress");
		progressBar.id = `pm_p_${key}`;
		progressBar.value = value;
		progressBar.max = max;
		newProgressItem.appendChild(progressBar);
	}
}
