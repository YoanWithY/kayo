import { KayoAPI } from "../KayoAPI/KayoAPI";
import { Viewport } from "../KayoInstance/ts/Viewport/Viewport";
import { UIViewport } from "../KayoInstance/ts/Viewport/UIViewport";
import { WindowUIBuilder } from "../../UI-Lib/WindowUIBUilder";

export interface KayoUIAPI {
    openNewWindow(): void;
    init(kayoAPI: KayoAPI): void;
    fullRerender(): void;
    requestAnimationFrameWith(viewport: Viewport): void;
    registerViewport(viewport: Viewport): void
    unregisterViewport(viewport: Viewport): void;
    setLoadingParagraphText(text: string): void;
    showSplashScreen(): void;
    removeSplashScreen(): void;
    removeLoadingScreen(): void;
    showLoadingScreen(): void;
    registerUIWindowBuilder(win: WindowUIBuilder<KayoAPI>): void;
    registerPaneType(domClassName: string, displayText: string): void;
    setMainUIWindow(win: WindowUIBuilder<KayoAPI>): void;
    requestInstanceUI(win: WindowUIBuilder<KayoAPI>, defaultElementClassName: string, buildHeader: boolean, buildFooter: boolean): void
    get windowUIBuilder(): Iterable<WindowUIBuilder<KayoAPI>>;
    get viewports(): Iterable<UIViewport>;
    get paneTypes(): Iterable<{ displayText: string, domClassName: string }>
}