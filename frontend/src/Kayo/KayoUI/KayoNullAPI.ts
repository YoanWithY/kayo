import { WindowUIBuilder } from "../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../KayoAPI/KayoAPI";
import { Viewport } from "../KayoInstance/ts/Viewport/Viewport";
import { KayoUIAPI } from "./KayoUIAPI";

export class KayoNullUI implements KayoUIAPI {
    public init(_: KayoAPI): void { }
    public fullRerender() { };
    public requestAnimationFrameWith(_: Viewport) { };
    public registerViewport(_: Viewport) { }
    public unregisterViewport(_: Viewport) { };
    public showSplashScreen(): void { }
    public removeSplashScreen(): void { }
    public showLoadingScreen(): void { }
    public removeLoadingScreen(): void { }
    public setLoadingParagraphText(_: string): void { }
    public registerUIWindowBuilder(_: WindowUIBuilder<KayoAPI>): void { }
    public setMainUIWindow(_: WindowUIBuilder<KayoAPI>): void { }
    public requestInstanceUI(_: WindowUIBuilder<KayoAPI>, __: string, ___: boolean, ____: boolean): void { }
    public openNewWindow(): void { }
    public registerPaneType(_: string, __: string): void { }
    public get windowUIBuilder(): Iterable<WindowUIBuilder<KayoAPI>> { return [] }
    public get viewports() { return [] };
    public get paneTypes(): Iterable<{ displayText: string; domClassName: string; }> { return []; }
}