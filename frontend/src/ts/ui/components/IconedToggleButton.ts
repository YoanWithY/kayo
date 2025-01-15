export class IconedToggleButton extends HTMLElement {
	onSvg!: string;
	offSvg!: string;
	onCallback!: () => void;
	offCalback!: () => void;
	isOn = false;

	constructor() {
		super();
		this.onclick = () => {
			if (this.isOn)
				this.turnOff();
			else
				this.turnOn();
		}
	}

	turnOn() {
		this.isOn = true;
		this.innerHTML = this.onSvg;
		this.onCallback();
	}

	turnOff() {
		this.isOn = false;
		this.innerHTML = this.offSvg;
		this.offCalback();
	}

	static createIconedToggleButton(win: Window, offSvg: string, onSvg: string, offCallback: () => void, onCalback: () => void, on = false) {
		const p = win.document.createElement("iconed-toggle-button") as IconedToggleButton;
		p.isOn = on;
		p.innerHTML = on ? onSvg : offSvg;
		p.offSvg = offSvg;
		p.onSvg = onSvg;
		p.offCalback = offCallback;
		p.onCallback = onCalback;
		return p;
	}
}