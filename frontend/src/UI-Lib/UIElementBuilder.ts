import { IOAPI } from "../IO-Interface/IOAPI";
import { WindowUIBuilder } from "./WindowUIBUilder";

export abstract class UIElementBuilder<T extends IOAPI, U extends HTMLElement> {
    protected abstract _domClassName: string;
    public windowUIBuilder!: WindowUIBuilder<T>;
    public get domClassName() {
        return this._domClassName;
    }
    protected abstract get _domClass(): CustomElementConstructor;

    public abstract build(config: any): U;

    protected abstract _initWindowComponentStyles(): void;

    public initWindowComponent() {
        this.windowUIBuilder.window.customElements.define(this._domClassName, this._domClass);
        this._initWindowComponentStyles();
    }

    protected createElement<X extends HTMLElement>(type: string): X {
        return this.windowUIBuilder.window.document.createElement(type) as X;
    }

    protected addStyle(css: string): HTMLStyleElement {
        const style = this.createElement<HTMLStyleElement>("style");
        style.innerHTML = css;
        this.windowUIBuilder.window.document.head.appendChild(style);
        return style;
    }
}
