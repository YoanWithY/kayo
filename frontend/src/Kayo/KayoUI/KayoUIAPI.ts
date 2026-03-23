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
    requestInstanceUI(win: WindowUIBuilder<KayoAPI>, defaultElementClassName: string, useHeader: boolean): void
    get windowUIInstances(): Iterable<WindowUIBuilder<KayoAPI>>;
    get viewports(): Iterable<UIViewport>;
}