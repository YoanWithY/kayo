import { initUI as initUIClasses } from "./ui/ui";
import type { Kayo } from "./Kayo";
import OutputPane from "./ui/panes/OutpuPane";

initUIClasses();
let kayo: Kayo;
window.name = "Kayo Sub";
const kayoFromWindow = window.opener.kayo as Kayo | undefined;
if (!kayoFromWindow) {
	close();
	throw new Error("No Kayo instance on the opener!");
}
kayo = kayoFromWindow;
window.addEventListener("beforeunload", (_) => {
	kayo.windows.delete(window);
});

kayo.registerWindow(window, OutputPane.getName());
