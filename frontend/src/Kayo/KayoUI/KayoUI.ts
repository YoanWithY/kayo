import { KayoUIAPI } from "./KayoUIAPI";
import { KayoAPI } from "../KayoAPI/KayoAPI";
import { UIElementBuilder } from "../../UI-Lib/UIElementBuilder";
import { SplashScreen, SplashScreenBuilder } from "./panes/SplashScreen/SplashScreen";
import { WrappingPane } from "../../UI-Lib/SplitPane/WrappingPane/WrappingPane";
import { UIViewport } from "../KayoInstance/ts/Viewport/UIViewport";
import { WindowUIBuilder } from "../../UI-Lib/WindowUIBUilder";
import { PaneSelectorPaneBuilder } from "./panes/PaneSelectorPane/PaneSelectorPane";
import { Viewport3DPaneBuilder } from "./panes/Viewport3DPane/Viewport3DPane";
import { Viewport3DPaneContentBuilder } from "./panes/Viewport3DPane/Viewport3DPaneContent";
import { Viewport3DPaneStripeBuilder } from "./panes/Viewport3DPane/Viewport3DPaneStripe";

export class KayoUI implements KayoUIAPI {
    private _kayoAPI!: KayoAPI;
    private _loadingScreen: HTMLDivElement;
    private _loadingParagraph: HTMLParagraphElement;
    private _splashScreen!: SplashScreen;
    private _viewports = new Set<UIViewport>();
    private _windowUIInstances: Set<WindowUIBuilder<KayoAPI>>;

    private constructor(loadingScreen: HTMLDivElement, loadingParagraph: HTMLParagraphElement) {
        this._loadingScreen = loadingScreen;
        this._loadingParagraph = loadingParagraph;
        this._windowUIInstances = new Set();
    }
    public openNewWindow(): void {
        open("/subwindow/", "_blank", "popup=true");
    }

    public fullRerender() {
        for (const vp of this._viewports)
            this.requestAnimationFrameWith(vp);
    }

    private requestedAnimationFrameForWindow: Map<Window, boolean> = new Map<Window, boolean>();
    private viewportsToUpdate = new Set<UIViewport>();
    public requestAnimationFrameWith(viewport: UIViewport) {
        this.viewportsToUpdate.add(viewport);

        if (this.requestedAnimationFrameForWindow.get(viewport.window)) return;
        this.requestedAnimationFrameForWindow.set(viewport.window, true);

        const windowAnimationFrame = () => {
            for (const v of this.viewportsToUpdate) {
                if (v.window != viewport.window) continue;
                const renderer = this._kayoAPI.project.renderers.get(v.rendererKey);
                if (!renderer) {
                    console.error(`Renderer with key "${v.rendererKey}" is not know to kayo.`);
                    continue;
                }
                if (!renderer.registeredViewports.has(v)) {
                    console.error(`Viewport "${v}" is not registered on renderer ${renderer}`);
                    continue;
                }
                renderer.renderViewport(v);
                this.viewportsToUpdate.delete(v);
            }

            this.requestedAnimationFrameForWindow.set(viewport.window, false);
        };
        viewport.window.requestAnimationFrame(windowAnimationFrame);
    }

    public registerViewport(viewport: UIViewport) {
        const renderer = this._kayoAPI.project.renderers.get(viewport.rendererKey);
        if (!renderer) {
            console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
            return;
        }
        this._viewports.add(viewport);
        renderer.registerViewport(viewport);
    }

    public unregisterViewport(viewport: UIViewport) {
        const renderer = this._kayoAPI.project.renderers.get(viewport.rendererKey);
        if (!renderer) {
            console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
            return;
        }
        this._viewports.delete(viewport);
        renderer.unregisterViewport(viewport);
    }

    public init(kayoAPI: KayoAPI) {
        this._kayoAPI = kayoAPI;
    }

    public setLoadingParagraphText(text: string): void {
        this._loadingParagraph.textContent = text;
    }
    public showSplashScreen(): void {
        window.document.body.appendChild(this._splashScreen);
    }
    public removeSplashScreen(): void {
        window.document.body.removeChild(this._splashScreen);
    }
    public showLoadingScreen(): void {
        window.document.body.appendChild(this._loadingScreen);
    }
    public removeLoadingScreen(): void {
        window.document.body.removeChild(this._loadingScreen);
    }

    public static createInstance() {
        const kayoUI = new KayoUI(
            window.document.getElementById("kayoLoading") as HTMLDivElement,
            window.document.getElementById("loadingParagraph") as HTMLParagraphElement);
        kayoUI.setLoadingParagraphText("Initi UI...");
        return kayoUI;
    }

    public get windowUIInstances() {
        return this._windowUIInstances.values();
    }

    public get viewports() {
        return this._viewports.values();
    }

    public static prepWindowUIBuilder(winUIBuilder: WindowUIBuilder<KayoAPI>) {
        const paneSelectorPaneBuilder = new PaneSelectorPaneBuilder();
        paneSelectorPaneBuilder.addPaneType("viewport-3d-pane", "Viewport 3D");

        const builders: UIElementBuilder<KayoAPI, any>[] = [
            new SplashScreenBuilder(),
            new Viewport3DPaneBuilder(),
            new Viewport3DPaneContentBuilder(),
            new Viewport3DPaneStripeBuilder(),
            paneSelectorPaneBuilder,
        ];
        for (const builder of builders)
            winUIBuilder.registerBuilder(builder);

        const f = (b: UIElementBuilder<KayoAPI, any>) => b.initWindowComponent();
        winUIBuilder.addRegisterBuilderListener(f, true);
    }

    /**
     * This must by called from JS controlflow that owns the window provided!
     */
    public registerUIWindowBuilder(winUIBuilder: WindowUIBuilder<KayoAPI>): void {
        if (this._windowUIInstances.has(winUIBuilder))
            return;

        (winUIBuilder.window as any).kayoAPI = this._kayoAPI;
        this._windowUIInstances.add(winUIBuilder);

        const contextMenueCallback = (e: Event) => {
            e.preventDefault();
        };
        winUIBuilder.window.document.addEventListener("contextmenu", contextMenueCallback);

        const splashScreen = winUIBuilder.build<SplashScreen>({ domClassName: "splash-screen" });
        if (!splashScreen) {
            console.error("Could not create Splash screen!");
            return
        }
        this._splashScreen = splashScreen;
        // -------------------------------------

    }

    public requestInstanceUI(winUIBuilder: WindowUIBuilder<KayoAPI>, defaultElementClassName: string, useHeader: boolean) {
        if (!this._windowUIInstances.has(winUIBuilder)) {
            console.error("The window the the instance UI is requested for ist not registered!")
            return;
        }

        const wrappingPane = winUIBuilder.build<WrappingPane>({ domClassName: "wrapping-pane", defaultElementClassName: defaultElementClassName, useHeader: useHeader });
        if (!wrappingPane) {
            console.error("Could not build Wrapping pane!");
            return;
        }
        winUIBuilder.window.document.body.appendChild(wrappingPane);
    }
}