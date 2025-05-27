import { Kayo } from "../Kayo";
import UIVariableComponent from "../ui/components/UIComponent";
import BasicPane from "../ui/panes/BasicPane";
import ptpChatTemplate from "./ptpChatPaneTemplate.json";

export type PTPMessage = { text: string; sender: number };

export class PTPMessageElement extends HTMLElement {
	_internals: ElementInternals = this.attachInternals();

	public static createUIElement(win: Window): PTPMessageElement {
		return win.document.createElement(this.getDomClass()) as PTPMessageElement;
	}
	public static getDomClass() {
		return "ptp-message-element";
	}
}

export class PTPChatContent extends UIVariableComponent {
	private _win!: Window;
	private _kayo!: Kayo;
	texts: PTPMessageElement[] = [];
	rebuild(value: PTPMessage[]) {
		for (const t of this.texts) this.removeChild(t);
		this.texts.length = 0;
		for (const v of value) {
			const p = PTPMessageElement.createUIElement(this._win);
			p._internals.states.add(v.sender === this._kayo.project.ptpBase.role.id ? "own" : "other");
			const name = this._win.document.createElement("h6");
			name.textContent = String(v.sender);
			const text = this._win.document.createElement("p");
			text.textContent = v.text;
			p.appendChild(name);
			p.appendChild(text);
			this.texts.push(p);
			this.appendChild(p);
		}
	}

	public setUiValue(_: string): void {
		console.error("Method not implemented.");
	}

	setValue(value: PTPMessage[]): void {
		this.rebuild(value);
		const newMessage = value[value.length - 1];
		if (newMessage === undefined) return;

		if (newMessage.sender === this._kayo.project.ptpBase.role.id) return;
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				new Notification(`${newMessage.sender}:`, {
					body: newMessage.text,
					icon: "./favicon.ico",
					badge: "./favicon.ico",
				});
			}
		});
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any): PTPChatContent {
		const p = win.document.createElement(this.getDomClass()) as PTPChatContent;
		p._win = win;
		p._kayo = kayo;
		p.bind(obj.stateVariableURL);
		return p;
	}

	public static getDomClass() {
		return "ptp-chat-content";
	}
}

export class PTPTextInput extends HTMLFormElement {
	constructor() {
		super();
		this.classList.add(PTPTextInput.getDomClass());
	}

	public static createUIElement(win: Window, _: Kayo, _1: any): PTPTextInput {
		const p = win.document.createElement("form", { is: this.getDomClass() }) as PTPTextInput;
		const textInput = win.document.createElement("input");
		textInput.setAttribute("type", "text");
		textInput.setAttribute("placeholder", "Message");
		p.appendChild(textInput);
		const sendButton = win.document.createElement("input");
		sendButton.setAttribute("type", "submit");
		sendButton.setAttribute("value", "Send");
		p.appendChild(sendButton);
		p.addEventListener("submit", (e: SubmitEvent) => {
			e.preventDefault();
			p.reset();
		});
		return p;
	}

	public static getDomClass() {
		return "ptp-text-input";
	}
}

export class PTPChatPane extends BasicPane {
	public static createUIElement(win: Window, kayo: Kayo): PTPChatPane {
		return super.createUIElement(win, kayo, ptpChatTemplate) as PTPChatPane;
	}
	public static getDomClass() {
		return "ptp-chat";
	}
	public static getName() {
		return "PTP Chat";
	}
}
