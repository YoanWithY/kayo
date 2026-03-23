import { KayoAPI } from "../../../Kayo/KayoAPI/KayoAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { DropDown } from "./DropDown";
import css from "./DropDownItem.css?inline";

export class DropDownItem extends HTMLElement {
    public internals: ElementInternals;
    public value?: string | number;
    public childDropDown?: DropDown;
    public parentDropDown!: DropDown;

    protected _onClick = (_: PointerEvent) => {
        if (this.value !== undefined) {
            this.parentDropDown.recieveItemValue(this.value);
            this.parentDropDown.close();
            return;
        }
        if (this.childDropDown) {
            // todo
        }
    };

    public constructor() {
        super();
        this.internals = this.attachInternals();
    }

    protected connectedCallback() {
        this.addEventListener("click", this._onClick);
    }

    protected disconnectedCallback() {
        this.removeEventListener("click", this._onClick);
    }

    public get isSubopener() {
        return this.childDropDown !== undefined;
    }
}

export class DropDownItemBuilder extends UIElementBuilder<KayoAPI, DropDownItem> {
    protected _domClassName = "drop-down-item";

    protected get _domClass() {
        return DropDownItem;
    }

    public build(win: Window, _: WindowUIBuilder<KayoAPI>, config: { parent: DropDown, displayText: string, itemValue: { value: string | number }, subDropDown?: object }): DropDownItem {
        const dropDownItem = win.document.createElement(this._domClassName) as DropDownItem;

        if (config.itemValue) {
            dropDownItem.value = config.itemValue.value;
        }

        return dropDownItem;
    }

    protected _initWindowComponentStyles(win: Window): void {
        this.addStyle(css, win);
    }

}
