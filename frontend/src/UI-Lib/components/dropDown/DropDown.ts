import { KayoAPI } from "../../../Kayo/KayoAPI/KayoAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { DropDownItem } from "./DropDownItem";
import css from "./DropDown.css?inline";

export class DropDown extends HTMLElement {
    private _win!: Window;
    public _internals: ElementInternals = this.attachInternals();
    private _dropDownItems: DropDownItem[] = [];
    public parentDropDownItem?: DropDownItem;

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

    public recieveItemValue(_: string | number) {
        throw new Error("Method not implemented.");
    }

}

export class DropDownBuilder extends UIElementBuilder<KayoAPI, DropDown> {
    protected _domClassName = "drop-down-container";

    protected get _domClass() {
        return DropDown;
    }

    public build(win: Window, builder: WindowUIBuilder<KayoAPI>, config: { options: any[], apiValue?: string }): DropDown {
        const dropDown = win.document.createElement(this._domClassName) as DropDown;

        for (const conf of config.options) {
            conf.parent = dropDown;
            const item = builder.build<DropDownItem>(win, conf);
            if (!item) {
                console.error(`Could not create DropDownItem from ${conf}`);
                continue;
            }
            dropDown.addDropDownItem(item);
        }

        return dropDown;
    }

    protected _initWindowComponentStyles(win: Window): void {
        this.addStyle(css, win);
    }

}