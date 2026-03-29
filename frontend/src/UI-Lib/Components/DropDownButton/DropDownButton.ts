import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { DropDown } from "../DropDown/DropDown";
import css from "./DropDownButton.css?inline"

class DropDownButton<T extends IOAPI> extends HTMLElement {
    public dropDown!: DropDown<T>;

    private _onClick = () => {
        const rect = this.getBoundingClientRect();
        this.dropDown.open(rect.left, rect.bottom);
    };

    protected connectedCallback() {
        this.addEventListener("click", this._onClick);
    }

    protected disconnectedCallback() {
        this.removeEventListener("click", this._onClick);
    }
}

export class DropDownButtonBuilder<T extends IOAPI> extends UIElementBuilder<T, DropDownButton<T>> {
    protected _domClassName = "drop-down-button";

    protected get _domClass(): CustomElementConstructor {
        return DropDownButton;
    }

    public build(windowUIBuilder: WindowUIBuilder<T>, config: { displayText: string, dropDown: any }) {
        const button = windowUIBuilder.createElement<DropDownButton<T>>(this._domClassName);
        button.innerHTML = config.displayText;
        const dropDown = windowUIBuilder.build<DropDown<T>>(config.dropDown);
        if (!dropDown) {
            console.log("Could not build DropDown from", config.dropDown);
            return button;
        }
        button.dropDown = dropDown;
        return button;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }
}