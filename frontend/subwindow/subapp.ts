import { initUI as initUIClasses } from "../src/ts/ui/ui";
import type { Kayo } from "../src/ts/Kayo";
import PaneSelectorPane from "../src/ts/ui/panes/PaneSelectorPane";

initUIClasses();
window.name = "Kayo Sub";
const openerKayo = window.opener.kayo as Kayo | undefined;
if (!openerKayo) {
	close();
	throw new Error("No Kayo instance on the opener!");
}
window.addEventListener("beforeunload", () => {
	openerKayo.windows.delete(window);
});

openerKayo.registerProjectOnWindow(window, PaneSelectorPane.getName(), false);
