export class DropDown extends HTMLElement {
	private _win!: Window;
	public _internals: ElementInternals = this.attachInternals();
	private _dropDownItems: DropDownItem[] = [];
	public static createSelectOptionWrapper(win: Window): DropDown {
		const p = win.document.createElement(this.getDomClass()) as DropDown;
		p._win = win;
		return p;
	}

	public close = () => {
		if (this.isConnected)
			this._win.document.body.removeChild(this);
		this._win.removeEventListener("mousedown", this.close);
	}

	public open(anchorPositionX: number, anchorPositionY: number) {
		this._win.document.body.appendChild(this);
		this.style.left = `${anchorPositionX}px`;
		this.style.top = `${anchorPositionY}px`;
		this._win.addEventListener("mousedown", this.close);
	}

	public addDropDownItem(dropDownItem: DropDownItem) {
		this._dropDownItems.push(dropDownItem);
		this.appendChild(dropDownItem);
	}

	public static getDomClass() {
		return "drop-down-container";
	}
}

export class DropDownItem extends HTMLElement {
	public _internals = this.attachInternals();
	protected _onActivate?: () => void;
	protected _parentDropDown!: DropDown;
	protected _childDropDown?: DropDown;
	protected _onPointerDown = (_: PointerEvent) => {
		if (this.isSubopener) {
			// todo:
		} else {
			if (this._onActivate)
				this._onActivate();
			this._parentDropDown.close();
		}
	};

	protected connectedCallback() {
		this.addEventListener("pointerdown", this._onPointerDown);
	}

	protected disconnectedCallback() {
		this.removeEventListener("pointerdown", this._onPointerDown);
	}

	public static createDropDownItem(win: Window, parentDropDown: DropDown, label: string, onActivate?: () => void): DropDownItem {
		const dropDownItem = win.document.createElement(this.getDomClass()) as DropDownItem;
		dropDownItem._parentDropDown = parentDropDown;
		dropDownItem._onActivate = onActivate;
		dropDownItem.textContent = label;
		return dropDownItem;
	}

	public get isSubopener() {
		return this._childDropDown !== undefined;
	}

	public static getDomClass() {
		return "drop-down-item";
	}
}
