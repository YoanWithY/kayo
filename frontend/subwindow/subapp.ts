import { initUI as initUIClasses } from "../src/ts/ui/ui";
import type { Kayo } from "../src/ts/Kayo";
import OutputPane from "../src/ts/ui/panes/OutpuPane";

initUIClasses();
window.name = "Kayo Sub";
const openerKayo = window.opener.kayo as Kayo | undefined;
if (!openerKayo) {
	close();
	throw new Error("No Kayo instance on the opener!");
}
window.addEventListener("beforeunload", (_) => {
	openerKayo.windows.delete(window);
});

openerKayo.registerWindow(window, OutputPane.getName(), false);
