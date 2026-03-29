import { View } from "../../../IO-Interface/Binding";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { DropDown } from "../DropDown/DropDown";
import css from "./SelectBox.css?inline";

export type SelectOptionValue = { value: string | number; text: string };

export class SelectBox<T extends IOAPI, O extends string | number> extends HTMLElement implements View<O> {
    public apiURL!: string;
    public dropDown!: DropDown<T>;

    private _onClick = () => {
        const rect = this.getBoundingClientRect();
        this.dropDown.open(rect.x, rect.bottom);
    }

    protected connectedCallback() {
        this.addEventListener("click", this._onClick);
    }

    protected disconnectedCallback() {
        this.removeEventListener("click", this._onClick);
    }

    public recieveValueChange(v: O): void {
        this.innerHTML = String(v);
    }
}

export class SelectBoxBuilder<T extends IOAPI, O extends string | number> extends UIElementBuilder<T, SelectBox<T, O>> {
    protected _domClassName = "select-box";

    protected get _domClass() {
        return SelectBox;
    }

    public build(
        windowUIBuilder: WindowUIBuilder<T>,
        config: { setValue?: { apiURL: string, options: { displayText: string, value: any }[] }, displayText?: string }
    ): SelectBox<T, string | number> {
        const selectBox = windowUIBuilder.createElement<SelectBox<T, string | number>>(this._domClassName);
        if (config.displayText !== undefined)
            selectBox.innerHTML = config.displayText;

        const dropDownConfig: { domClassName: string, options: { displayText: string, setValue?: { value: any, apiURL: string } }[] }
            = { domClassName: "drop-down", options: [] };

        if (config.setValue) {
            for (const option of config.setValue.options)
                dropDownConfig.options.push({ displayText: option.displayText, setValue: { value: option.value, apiURL: config.setValue.apiURL } });
        }

        const dropDown = windowUIBuilder.build<DropDown<T>>(dropDownConfig);
        if (!dropDown) {
            console.error("Could not build DropDown");
            return selectBox;
        }
        selectBox.dropDown = dropDown;

        if (config.setValue)
            windowUIBuilder.IOAPI.addChangeObserver(config.setValue.apiURL, selectBox, true);

        return selectBox;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }
}

