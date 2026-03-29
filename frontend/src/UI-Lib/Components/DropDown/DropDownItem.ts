import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { DropDown } from "./DropDown";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import css from "./DropDownItem.css?inline";

export class DropDownItem<T extends IOAPI> extends HTMLElement {
    public childDropDown?: DropDown<T>;
    public parentDropDown!: DropDown<T>;
    public onAction?: () => void;

    protected _onClick = (_: Event) => {
        if (this.childDropDown) {
            const rect = this.getBoundingClientRect();
            this.childDropDown?.open(rect.right, rect.top);
            return;
        }

        if (this.onAction) {
            this.onAction();
        }
        this.parentDropDown.close(true);
    };

    protected connectedCallback() {
        this.addEventListener("click", this._onClick);
    }

    protected disconnectedCallback() {
        this.removeEventListener("click", this._onClick);
    }

}

type DropDownItemConfig<T extends IOAPI> = { domClassName: "drop-down-item", dropDown: DropDown<T>, displayText: string, setValue?: { value: any, apiURL: string }, childDropDown?: any };

export class DropDownItemBuilder<T extends IOAPI> extends UIElementBuilder<T, DropDownItem<T>> {
    protected _domClassName = "drop-down-item";

    protected get _domClass() {
        return DropDownItem;
    }

    public build(
        windowUIBuilder: WindowUIBuilder<T>,
        config: DropDownItemConfig<T>
    ): DropDownItem<T> {
        const dropDownItem = windowUIBuilder.createElement<DropDownItem<T>>(this._domClassName);
        dropDownItem.textContent = config.displayText;
        dropDownItem.parentDropDown = config.dropDown;

        if (config.setValue) {
            const setValue = config.setValue;
            dropDownItem.onAction = () => {
                windowUIBuilder.IOAPI.setAPIValue(setValue.apiURL, setValue.value);
            }
        }
        else if (config.childDropDown) {
            const conf = { ...config.childDropDown, parentDropDownItem: dropDownItem }
            const dropDown = windowUIBuilder.build<DropDown<T>>(conf);
            if (!dropDown) {
                console.error("Could not build DropDown from", config.childDropDown);
                return dropDownItem;
            }
            dropDownItem.classList.add("dropDownParentItem");
            dropDownItem.childDropDown = dropDown;
        }

        return dropDownItem;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }

}
