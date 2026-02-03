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
		const dblClickCallback = (e: MouseEvent) => {
			if (win.document.fullscreenElement) {
				win.document.exitFullscreen();
			} else {
				(e.target as HTMLElement).requestFullscreen();
			}
		};
		const ptpx = kayo.project.ptpx;
		const addTrackEvent = (e: RTCTrackEvent) => {
			if (e.track.kind !== "video") return;
			const vid = win.document.createElement("video");
			vid.srcObject = e.streams[0]
			vid.play();
			vid.addEventListener("dblclick", dblClickCallback)
			p.appendChild(vid);
			console.log("sdfdfs");
		}
		if (ptpx.role.wsRole == "Leader") {
			for (const [_, con] of (ptpx.role as Leader).connectionsMap) {
				con.addEventListener("track", addTrackEvent);
			}
		} else {
			(ptpx.role as Follower).leaderConnection.addEventListener("track", addTrackEvent);
		}

		const streamCallback = (stream: MediaStream) => {
			const vid = win.document.createElement("video");

			vid.addEventListener("dblclick", dblClickCallback)
			const videoCaps = stream.getVideoTracks()[0].getCapabilities();
			stream.getVideoTracks()[0].applyConstraints({ width: { exact: videoCaps.width?.max } });

			vid.srcObject = stream;
			vid.play();
			p.appendChild(vid);

			if (!ptpx) return;
			if (ptpx.role.wsRole == "Leader") {
				for (const track of stream.getTracks()) {
					for (const [_, con] of (ptpx.role as Leader).connectionsMap) {
						con.addTrack(track, stream);
						// eslint-disable-next-line local/no-anonymous-arrow-function
						const sender = con.getSenders().find(s => s.track?.kind === "video");
						if (sender) {
							const params = sender.getParameters();
							if (params.encodings && params.encodings.length) {
								params.encodings[0].maxBitrate = 1_000_000_000; // 100 Gbps
								sender.setParameters(params);
							}
						}
					}
				}
			} else {
				for (const track of stream.getTracks()) {
					(ptpx.role as Follower).leaderConnection.addTrack(track, stream);
				}
			}
		}

		const displayShareButton = win.document.createElement("button");
		displayShareButton.textContent = "Display Share";
		// eslint-disable-next-line local/no-anonymous-arrow-function
		displayShareButton.addEventListener("click", () => {
			navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(streamCallback);
		});
		p.appendChild(displayShareButton);

		const devicesCallback = (devices: MediaDeviceInfo[]) => {
			// eslint-disable-next-line local/no-anonymous-arrow-function
			const cameras = devices.filter(d => d.kind === "videoinput");

			for (const cam of cameras) {
				const startVideoButton = win.document.createElement("button");
				startVideoButton.textContent = `Start [${cam.label}]`;
				const startCallback = () => {

					navigator.mediaDevices.getUserMedia({
						video: {
							deviceId: { exact: cam.deviceId },
						},
						audio: {
							noiseSuppression: { exact: false },
							echoCancellation: { exact: false },
							autoGainControl: { exact: false }
						}
					}).then(streamCallback);
				};
				startVideoButton.addEventListener("click", startCallback)
				p.appendChild(startVideoButton);

			}
		}
		navigator.mediaDevices.enumerateDevices().then(devicesCallback);
		return p;
	}
	public static getDomClass() {
		return "ptp-chat";
	}
	public static getName() {
		return "PTP Chat";
	}
}
