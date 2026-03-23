import { KayoAPI } from "../src/Kayo/KayoAPI/KayoAPI";
import { WindowUIBuilder } from "../src/UI-Lib/WindowUIBUilder";

const kayoAPI = window.opener.kayoAPI as KayoAPI | undefined;
if (!kayoAPI) {
	throw new Error("No Kayo instance on the opener!");
}

window.name = "KayoUI Subwindow";

const windowUIBuilder = new WindowUIBuilder(window, kayoAPI);

kayoAPI.ui.registerUIWindowBuilder(windowUIBuilder);
kayoAPI.ui.requestInstanceUI(windowUIBuilder, "pane-selector-pane", false)
