import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./KayoWasmLoader";
import { ViewportPane } from "./ui/panes/ViewportPane";
import { GPUX } from "./GPUX";
import { FileRessourceManager } from "./FileRessourceManager";

const loadPara = window.document.getElementById("loadingParagraph") as HTMLParagraphElement;
loadPara.textContent = "Initi UI...";
initUIClasses();

window.name = "Kayo Main";
loadPara.textContent = "Initi WebGPU";
const gpux = await GPUX.requestGPUX();
if (typeof gpux === "string") {
	alert(`Could not initialize WebGPU with reason: ${gpux}`);
	throw new Error("Could not initialize WebGPU!", { cause: gpux });
}

loadPara.textContent = "Initi WASM...";
const wasmx = await initWasmx();

loadPara.textContent = "Init file system...";
const fileRessourceManager = await FileRessourceManager.requestFileRessourceManager();
if (typeof fileRessourceManager === "string") {
	alert(`Could not initialize WebGPU with reason: ${fileRessourceManager}`);
	throw new Error("Could not initialize WebGPU!", { cause: fileRessourceManager });
}

const kayo = new Kayo(gpux, wasmx, fileRessourceManager);
(window as any).kayo = kayo;

window.addEventListener("beforeunload", (e) => {
	if (kayo.windows.size > 1) {
		kayo.closeAllSecondaryWindows(window);
		e.preventDefault();
	}
});

setTimeout(() => {
	window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
}, 100);

kayo.registerWindow(window, ViewportPane.getName(), true);
