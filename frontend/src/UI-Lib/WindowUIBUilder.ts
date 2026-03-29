import { IOAPI } from "../IO-Interface/IOAPI";
import { DropDownBuilder } from "./Components/DropDown/DropDown";
import { DropDownItemBuilder } from "./Components/DropDown/DropDownItem";
import { SelectBoxBuilder } from "./Components/SelectBox/SelectBox";
import { TabbedPaneBuilder } from "./Components/TabbedPane/TabbedPane";
import { SplitablePaneBuilder } from "./SplitPane/SplitablePane/SplitablePane";
import { SplitButtonBuilder } from "./SplitPane/SplitButton/SplitButton";
import { SplitPaneContainerBuilder } from "./SplitPane/SplitPaneContainer/SplitPaneContainer";
import { SplitPaneDividerBuilder } from "./SplitPane/SplitPaneDivider/SplitPaneDivider";
import { SplitPaneGrabberBuilder } from "./SplitPane/SplitPaneDivider/SplitPaneGrabber";
import { WrappingPaneBuilder } from "./SplitPane/WrappingPane/WrappingPane";
import { UIElementBuilder } from "./UIElementBuilder";

/**
 * The Builder that builds all components for the UI.
 * @template T The API class type that will be available to all builders.
 */
export class WindowUIBuilder<T extends IOAPI> {
    private _window: Window;
    private _ioapi: T;
    private _builders: Map<string, UIElementBuilder<T, any>>;
    private _registerBuilderCallbacks: Set<((builder: UIElementBuilder<T, any>) => void)>;
    private _isMainWindow: boolean;

    public constructor(window: Window, ioapi: T, isMainWindow: boolean) {
        this._window = window;
        this._ioapi = ioapi;
        this._builders = new Map();
        this._registerBuilderCallbacks = new Set();
        this._isMainWindow = isMainWindow;

        const dynamicBuildDomClass = (b: UIElementBuilder<any, any>) => {
            try {
                // eslint-disable-next-line prefer-const
                let DynamicCustomClass: CustomElementConstructor = HTMLElement;
                eval(`DynamicCustomClass = ${b.domClassCodeString}`);

                b.initWindowComponent(this, DynamicCustomClass);
            } catch (e) {
                console.error(e);
            }
        }
        this.addRegisterBuilderListener(dynamicBuildDomClass, true);
    }

    public static getBaseElementBuilderInstances<T extends IOAPI>(): UIElementBuilder<T, any>[] {
        return [
            new WrappingPaneBuilder<T>(),
            new SplitPaneContainerBuilder<T>(),
            new SplitablePaneBuilder<T>(),
            new SplitButtonBuilder<T>(),
            new SplitPaneDividerBuilder<T>(),
            new SplitPaneGrabberBuilder<T>(),
            new TabbedPaneBuilder<T>(),
            new SelectBoxBuilder<T, any>(),
            new DropDownBuilder<T>(),
            new DropDownItemBuilder<T>(),
        ]
    }

    public get window() {
        return this._window;
    }

    public get IOAPI() {
        return this._ioapi;
    }

    public get isMainWindow() {
        return this._isMainWindow;
    }

    public registerBuilder<U extends HTMLElement>(builder: UIElementBuilder<T, U>) {
        this._builders.set(builder.domClassName, builder);
        for (const f of this._registerBuilderCallbacks)
            f(builder);
    }

    public build<U extends HTMLElement>(config: { domClassName: string, [key: string]: unknown }) {
        const builder = this._builders.get(config.domClassName) as UIElementBuilder<T, U>;
        if (!builder)
            return undefined;
        return builder.build(this, config);
    }

    public createElement<X extends HTMLElement>(type: string): X {
        return this.window.document.createElement(type) as X;
    }

    public addStyle(css: string): HTMLStyleElement {
        const style = this.createElement<HTMLStyleElement>("style");
        style.innerHTML = css;
        this.window.document.head.appendChild(style);
        return style;
    }

    public getBuilder<X extends UIElementBuilder<T, any>>(domClass: string) {
        return this._builders.get(domClass) as X | undefined;
    }

    public addRegisterBuilderListener<U extends HTMLElement>(f: (builder: UIElementBuilder<T, U>) => void, fireAllCurrentRegistered: boolean) {
        this._registerBuilderCallbacks.add(f);
        if (!fireAllCurrentRegistered)
            return
        for (const builder of this._builders.values())
            f(builder);
    }

    public removeRegisterBuilderListener<U extends HTMLElement>(f: (builder: UIElementBuilder<T, U>) => void) {
        this._registerBuilderCallbacks.delete(f);
    }
}
