import { Kayo } from "../Kayo";
import { DropDown, DropDownItem } from "../ui/components/DropDown";
import { IncomingStream, OutgoingStream } from "./PTPTrackLog";


export class PTPChatPane extends HTMLElement {
	private _kayo!: Kayo;
	private _win!: Window;
	public static createUIElement(win: Window, kayo: Kayo): PTPChatPane {
		const p = win.document.createElement(this.getDomClass()) as PTPChatPane;
		p._kayo = kayo;
		p._win = win;

		if (!kayo.project.ptpx) {
			const h = win.document.createElement("h2");
			h.textContent = "Could not connect to peer session!";
			p.appendChild(h);
			return p;
		}

		const fsRootIDButton = win.document.createElement("button");
		fsRootIDButton.textContent = "Copy Project ID";
		const copyListener = () => {
			const notifyCopyCallback = () => {
				win.alert("Copyied Project ID to Clipboard.\nYou may share it with someone over a secure channel.");
			}
			navigator.clipboard.writeText(p._kayo.project.fsRootName).then(notifyCopyCallback);
		};
		fsRootIDButton.addEventListener("click", copyListener);
		p.appendChild(fsRootIDButton);

		if (!navigator.mediaDevices)
			return p;

		const ptpx = kayo.project.ptpx;
		const newStreamButton = win.document.createElement("button");
		newStreamButton.textContent = "Add Stream";
		p.appendChild(newStreamButton);

		const clickCallback = () => {
			const devicesCallback = (devices: MediaDeviceInfo[]) => {
				const dropDown = DropDown.createSelectOptionWrapper(win);

				if (!!navigator.mediaDevices.getDisplayMedia) {
					const onSelect = () => {
						ptpx.trackLog.requestDisplayMedia();
					};
					dropDown.addDropDownItem(DropDownItem.createDropDownItem(win, dropDown, "[Screen Cast]", onSelect))
				};

				for (const dev of devices) {
					if (dev.kind == "audioinput") {
						const onSelect = () => {
							ptpx.trackLog.requestUserMedia({
								audio: {
									deviceId: { exact: dev.deviceId }
								}
							});
						};
						dropDown.addDropDownItem(DropDownItem.createDropDownItem(win, dropDown, `[Audio] ${dev.label}`, onSelect))
					} else if (dev.kind == "videoinput") {
						const onSelect = () => {
							ptpx.trackLog.requestUserMedia({
								video: {
									deviceId: { exact: dev.deviceId }
								}
							});
						};
						dropDown.addDropDownItem(DropDownItem.createDropDownItem(win, dropDown, `[Video] ${dev.label}`, onSelect))
					}
				}

				const rect = newStreamButton.getBoundingClientRect();
				dropDown.open(rect.x, rect.bottom);
			}
			navigator.mediaDevices.enumerateDevices().then(devicesCallback);
		}

		newStreamButton.addEventListener("click", clickCallback)
		return p;
	}

	private _addOutgoingCallback = (outgoingStream: OutgoingStream) => {
		const stream = outgoingStream.stream;
		const track = stream.getTracks()[0];
		if (track.kind == "video") {
			const vid = this._win.document.createElement("video");
			// eslint-disable-next-line local/no-anonymous-arrow-function
			vid.addEventListener("dblclick", () => {
				if (!this._win.document.fullscreenElement)
					vid.requestFullscreen();
			});
			vid.srcObject = stream;
			this.appendChild(vid);
			vid.play();
		} else {
			console.log("I do not add loopback.");
			// todo: audiovis.
		}
	};
	private _addIncomingCallback = (incommingStream: IncomingStream) => {
		const stream = incommingStream.stream;
		const track = stream.getTracks()[0];
		if (track.kind == "video") {
			const vid = this._win.document.createElement("video");
			// eslint-disable-next-line local/no-anonymous-arrow-function
			vid.addEventListener("dblclick", () => {
				if (!this._win.document.fullscreenElement)
					vid.requestFullscreen();
			});
			vid.srcObject = stream;
			this.appendChild(vid);
			vid.play();
		} else {
			const aud = this._win.document.createElement("audio");
			aud.srcObject = stream;
			this.appendChild(aud);
			aud.play();
			this._win.document.body.appendChild(aud);
		};
	};
	protected connectedCallback() {
		this._kayo.project.ptpx.trackLog.addOutgoingListener(this._addOutgoingCallback);
		this._kayo.project.ptpx.trackLog.addIncomingListener(this._addIncomingCallback);
	}

	protected disconnectedCallback() {
		this._kayo.project.ptpx.trackLog.removeOutgoingListener(this._addOutgoingCallback);
		this._kayo.project.ptpx.trackLog.removeIncommingListener(this._addIncomingCallback);
	}

	public static getDomClass() {
		return "ptp-chat";
	}
	public static getName() {
		return "PTP Chat";
	}
}
