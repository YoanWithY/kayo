import { IOAPI } from "../IO-Interface/IOAPI";
import { WindowUIBuilder } from "./WindowUIBUilder";

export abstract class UIElementBuilder<T extends IOAPI, U extends HTMLElement> {
    protected abstract _domClassName: string;
    public get domClassName() {
        return this._domClassName;
    }
    protected abstract get _domClass(): CustomElementConstructor;

    public get domClassCodeString() {
        return this._domClass.toString();
    }

    public abstract build(windowUIBuilder: WindowUIBuilder<T>, config: any): U;

    protected abstract _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void;

    public initWindowComponent(windowUIBuilder: WindowUIBuilder<T>, WindowRealCustomElement: CustomElementConstructor) {
        windowUIBuilder.window.customElements.define(this._domClassName, WindowRealCustomElement);
        this._initWindowComponentStyles(windowUIBuilder);
    }
}
