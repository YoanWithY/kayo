import { IOAPI } from "../IO-Interface/IOAPI";
import { SplitablePaneBuilder } from "./SplitPane/SplitablePane/SplitablePane";
import { SplitButtonLLBuilder, SplitButtonLRBuilder, SplitButtonULBuilder, SplitButtonURBuilder } from "./SplitPane/SplitButton/SplitButton";
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

    public constructor(window: Window, ioapi: T) {
        this._window = window;
        this._ioapi = ioapi;
        this._builders = new Map();
        this._registerBuilderCallbacks = new Set();

        this.registerBuilder(new WrappingPaneBuilder());
        this.registerBuilder(new SplitPaneContainerBuilder());
        this.registerBuilder(new SplitablePaneBuilder());
        this.registerBuilder(new SplitButtonULBuilder());
        this.registerBuilder(new SplitButtonURBuilder());
        this.registerBuilder(new SplitButtonLLBuilder());
        this.registerBuilder(new SplitButtonLRBuilder());
        this.registerBuilder(new SplitPaneDividerBuilder());
        this.registerBuilder(new SplitPaneGrabberBuilder());
    }

    public get window() {
        return this._window;
    }

    public get IOAPI() {
        return this._ioapi;
    }

    public registerBuilder<U extends HTMLElement>(builder: UIElementBuilder<T, U>) {
        builder.windowUIBuilder = this;
        this._builders.set(builder.domClassName, builder);
        for (const f of this._registerBuilderCallbacks)
            f(builder);
    }

    public build<U extends HTMLElement>(config: { domClassName: string, [key: string]: unknown }) {
        const builder = this._builders.get(config.domClassName) as UIElementBuilder<T, U>;
        if (!builder)
            return undefined;
        return builder.build(config);
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
