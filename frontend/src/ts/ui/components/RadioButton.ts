export class RadioButton extends HTMLElement {
	protected _internals: ElementInternals;
	protected _wrapper!: RadioButtonWrapper;
	protected _name!: string;
	protected _activateCallback!: () => void;

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	public get name() {
		return this._name;
	}

	/**
	 * Should only be called by the wrapper.
	 */
	public activate() {
		this._activateCallback();
		this._internals.states.add("active");
	}

	/**
	 * Should only be called by the wrapper.
	 */
	public deactivate() {
		this._internals.states.delete("active");
	}

	protected _clickedCallback = (e: MouseEvent) => {
		e.preventDefault();
		this._wrapper.setActive(this._name);
	};

	protected _pointerDownCallback = (e: PointerEvent) => {
		e.stopPropagation();
	};

	protected _pointerUpCallback = (e: PointerEvent) => {
		e.stopPropagation();
	};

	protected _pointerMoveCallback = (e: PointerEvent) => {
		e.stopPropagation();
	};

	protected connectedCallback() {
		this.addEventListener("click", this._clickedCallback);
		this.addEventListener("pointerdown", this._pointerDownCallback);
		this.addEventListener("pointerup", this._pointerUpCallback);
		this.addEventListener("pointermove", this._pointerMoveCallback);
	}

	protected disconnectedCallback() {
		this.removeEventListener("click", this._clickedCallback);
		this.removeEventListener("pointerdown", this._pointerDownCallback);
		this.removeEventListener("pointerup", this._pointerUpCallback);
		this.removeEventListener("pointermove", this._pointerMoveCallback);
	}

	public static createRadioButton(
		win: Window,
		wrapper: RadioButtonWrapper,
		name: string,
		activateCallback: () => void,
	) {
		const p = win.document.createElement(this.getDomClass()) as RadioButton;
		p._name = name;
		p._wrapper = wrapper;
		p._activateCallback = activateCallback;
		p.innerHTML = `<span>${name}</span>`;
		return p;
	}

	public static getDomClass(): string {
		return "radio-button";
	}
}

export class RadioButtonWrapper extends HTMLElement {
	protected _buttons!: RadioButton[];
	protected _nameButtonMap: { [key: string]: RadioButton } = {};
	protected _active!: RadioButton;

	public setActive(name: string) {
		const button = this._nameButtonMap[name];
		if (!button) {
			console.error(`No button with name "${name}"!`);
			return;
		}
		this._active?.deactivate();
		button.activate();
		this._active = button;
	}

	public setButtons(buttons: RadioButton[]) {
		for (const b of this._buttons) this.removeChild(b);
		this._buttons = buttons;
		this._nameButtonMap = {};
		for (const button of buttons) this._nameButtonMap[button.name] = button;
		for (const b of this._buttons) this.appendChild(b);
	}

	public static createRadioButtonWrapper(win: Window) {
		const p = win.document.createElement(this.getDomClass()) as RadioButtonWrapper;
		p._buttons = [];
		return p;
	}

	public static getDomClass(): string {
		return "radio-button-wrapper";
	}
}
