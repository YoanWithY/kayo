import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { DropDownItem } from "./DropDownItem";
import css from "./DropDown.css?inline";
import { IOAPI } from "../../../IO-Interface/IOAPI";

export class DropDown<T extends IOAPI> extends HTMLElement {
    public windowUIBuilder!: WindowUIBuilder<T>;
    private _dropDownItems: DropDownItem<T>[] = [];
    public parentDropDownItem?: DropDownItem<T>;

    public close = (closeParents: boolean = false) => {
        if (!this.isConnected)
            return

        this.closeChildren();
        this.windowUIBuilder.window.document.body.removeChild(this);

        if (closeParents && this.parentDropDownItem)
            this.parentDropDownItem.parentDropDown.close(true);
    }

    public closeChildren() {
        for (const item of this._dropDownItems)
            if (item.childDropDown)
                item.childDropDown.close();
    }

    public open(anchorPositionX: number, anchorPositionY: number) {
        this.windowUIBuilder.window.document.body.appendChild(this);
        this.style.left = `${anchorPositionX}px`;
        this.style.top = `${anchorPositionY}px`;

    }

    public handleWindowPointerDown = (e: Event) => {
        if (!this.composedPathCotainsSubtreeItem(e.composedPath()))
            this.close();
    }

    public composedPathCotainsSubtreeItem(e: EventTarget[]): boolean {
        if (e.includes(this))
            return true;

        for (const item of this._dropDownItems) {
            if (item.childDropDown && item.childDropDown.composedPathCotainsSubtreeItem(e))
                return true
        }

        return false;
    }

    protected connectedCallback() {
        this.windowUIBuilder.window.document.addEventListener("pointerdown", this.handleWindowPointerDown);
    }

    protected disconnectedCallback() {
        this.windowUIBuilder.window.document.removeEventListener("pointerdown", this.handleWindowPointerDown);
    }

    public addDropDownItem(dropDownItem: DropDownItem<T>) {
        this._dropDownItems.push(dropDownItem);
        this.appendChild(dropDownItem);
    }
}

export class DropDownBuilder<T extends IOAPI> extends UIElementBuilder<T, DropDown<T>> {
    protected _domClassName = "drop-down";

    protected get _domClass() {
        return DropDown;
    }

    public build(
        windowUIBuilder: WindowUIBuilder<T>,
        config: { options: { displayText: string, setValue?: { value: any, apiURL: string } }[], parentDropDownItem?: DropDownItem<T> }
    ): DropDown<T> {
        const dropDown = windowUIBuilder.createElement<DropDown<T>>(this._domClassName);
        dropDown.windowUIBuilder = windowUIBuilder;
        dropDown.parentDropDownItem = config.parentDropDownItem

        for (const conf of config.options) {
            const itemConfig = { domClassName: "drop-down-item", dropDown: dropDown, ...conf };

            const item = windowUIBuilder.build<DropDownItem<T>>(itemConfig);
            if (!item) {
                console.error(`Could not create DropDownItem from ${itemConfig}`);
                continue;
            }
            dropDown.addDropDownItem(item);
        }

        return dropDown;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }

}