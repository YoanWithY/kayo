import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./ressourceManagement/KayoWasmLoader";
import { ViewportPane } from "./ui/panes/ViewportPane";
import { GPUX } from "./GPUX";
import { FileRessourceManager } from "./ressourceManagement/FileRessourceManager";
import { StoreFileTask as StoreFileTask } from "./ressourceManagement/StoreFileTask";
import { SplashScreen } from "./ui/panes/SplashScreen";
import TextureUtils from "./Textures/TextureUtils";

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
TextureUtils.init(gpux);

loadPara.textContent = "Initi WASM...";
const wasmx = await initWasmx();

loadPara.textContent = "Init file system...";
const fileRessourceManager = await FileRessourceManager.requestFileRessourceManager();

if (typeof fileRessourceManager === "string") {
	alert(`Could not initialize File System with reason: ${fileRessourceManager}`);
	throw new Error("File System error!", { cause: fileRessourceManager });
}

loadPara.textContent = "Init Workers...";
await wasmx.taskQueue.initWorkers(fileRessourceManager.projectRootName);
wasmx.taskQueue.queueTask(
	new StoreFileTask(
		wasmx,
		fileRessourceManager.projectRootName,
		"meta.json",
		new TextEncoder().encode(JSON.stringify({ created: new Date().toISOString() })),
	),
);

const kayo = new Kayo(gpux, wasmx, fileRessourceManager);
(window as any).kayo = kayo;

window.addEventListener("beforeunload", (_) => {
	if (kayo.windows.size > 1) kayo.closeAllSecondaryWindows(window);
});

kayo.registerWindow(window, ViewportPane.getName(), true);

window.document.body.appendChild(await SplashScreen.createUIElement(window, kayo));

window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
