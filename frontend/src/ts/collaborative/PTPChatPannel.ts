import { Kayo } from "../Kayo";
import { Follower } from "./Follower";
import { Leader } from "./Leader";

export type PTPMessage = { text: string; sender: number };

export class PTPMessageElement extends HTMLElement {
	public _internals: ElementInternals = this.attachInternals();

	public static createUIElement(win: Window): PTPMessageElement {
		return win.document.createElement(this.getDomClass()) as PTPMessageElement;
	}
	public static getDomClass() {
		return "ptp-message-element";
	}
}

export class PTPChatContent extends HTMLElement {
	private _win!: Window;
	private _kayo!: Kayo;
	public texts: PTPMessageElement[] = [];
	public rebuild(value: PTPMessage[]) {
		for (const t of this.texts) this.removeChild(t);
		this.texts.length = 0;
		for (const v of value) {
			const p = PTPMessageElement.createUIElement(this._win);
			p._internals.states.add(v.sender === this._kayo.project.ptpx.role.id ? "own" : "other");
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

	public setValue(value: PTPMessage[]): void {
		this.rebuild(value);
		const newMessage = value[value.length - 1];
		if (newMessage === undefined) return;

		if (newMessage.sender === this._kayo.project.ptpx.role.id) return;
		const permissionCallback = (permission: NotificationPermission) => {
			if (permission === "granted") {
				new Notification(`${newMessage.sender}:`, {
					body: newMessage.text,
					icon: "./favicon.ico",
					badge: "./favicon.ico",
				});
			}
		};
		Notification.requestPermission().then(permissionCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo): PTPChatContent {
		const p = win.document.createElement(this.getDomClass()) as PTPChatContent;
		p._win = win;
		p._kayo = kayo;
		return p;
	}

	public static getDomClass() {
		return "ptp-chat-content";
	}
}

export class PTPTextInput extends HTMLFormElement {
	public constructor() {
		super();
		this.classList.add(PTPTextInput.getDomClass());
	}

	public static createUIElement(win: Window, _: Kayo): PTPTextInput {
		const p = win.document.createElement("form", { is: this.getDomClass() }) as PTPTextInput;
		const textInput = win.document.createElement("input");
		textInput.setAttribute("type", "text");
		textInput.setAttribute("placeholder", "Message");
		p.appendChild(textInput);
		const sendButton = win.document.createElement("input");
		sendButton.setAttribute("type", "submit");
		sendButton.setAttribute("value", "Send");
		p.appendChild(sendButton);
		const submitCallback = (e: SubmitEvent) => {
			e.preventDefault();
			p.reset();
		};
		p.addEventListener("submit", submitCallback);
		return p;
	}

	public static getDomClass() {
		return "ptp-text-input";
	}
}

export class PTPChatPane extends HTMLElement {
	public static createUIElement(win: Window, kayo: Kayo): PTPChatPane {
		const p = win.document.createElement(this.getDomClass()) as PTPChatPane;
		// const ptpChatContent = PTPChatContent.createUIElement(win, kayo);
		// const ptpChatInput = PTPTextInput.createUIElement(win, kayo);
		// p.appendChild(ptpChatContent);
		// p.appendChild(ptpChatInput);
		const vid = win.document.createElement("video");
		if (kayo.project.ptpx.role.wsRole == "Leader") {
			const supported = navigator.mediaDevices.getSupportedConstraints();
			console.log(supported);
			navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
				// eslint-disable-next-line local/no-anonymous-arrow-function
			}).then((stream) => {
				console.log(stream.getVideoTracks()[0].getCapabilities());
				stream.getVideoTracks()[0].applyConstraints({ width: { exact: 1920 } });
				vid.srcObject = stream;
				vid.play();
				for (const track of stream.getTracks()) {
					for (const [_, con] of (kayo.project.ptpx.role as Leader).connectionsMap) {
						con.addTrack(track, stream);
					}
				}
			});
		} else {
			(kayo.project.ptpx.role as Follower).leaderConnection.addEventListener("track",
				// eslint-disable-next-line local/no-anonymous-arrow-function
				(e) => {
					vid.srcObject = e.streams[0]
					vid.play();
				})
		}
		p.appendChild(vid);
		return p;
	}
	public static getDomClass() {
		return "ptp-chat";
	}
	public static getName() {
		return "PTP Chat";
	}
}
