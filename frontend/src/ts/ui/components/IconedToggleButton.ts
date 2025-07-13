export type ToggleState = { svgIcon: string; callback: () => void };

export class IconedToggleButton extends HTMLElement {
	protected _states!: ToggleState[];
	protected _state!: number;
	private _onClickCallback = (e: MouseEvent) => {
		e.stopImmediatePropagation();
		this._state = (this._state + 1) % this._states.length;
		this.setStateUIOnly(this._state);
		this._states[this._state].callback();
	};

	/**
	 * Sets the button to the ui state without triggering any callbacks.
	 * @param state
	 */
	public setStateUIOnly(state: number) {
		this.innerHTML = this._states[state].svgIcon;
		this._state = state;
	}

	protected connectedCallback() {
		this.addEventListener("click", this._onClickCallback);
	}

	protected disconnectedCallback() {
		this.removeEventListener("click", this._onClickCallback);
	}

	public static createIconedToggleButton(win: Window, states: ToggleState[], state: number) {
		const p = win.document.createElement("iconed-toggle-button") as IconedToggleButton;
		p._states = states;
		p._state = state;
		p.setStateUIOnly(state);
		return p;
	}
}
