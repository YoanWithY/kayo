/* eslint-disable local/no-await */
import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./ressourceManagement/KayoWasmLoader";
import { ViewportPane } from "./ui/panes/ViewportPane";
import { GPUX } from "./GPUX";
import { SplashScreen } from "./ui/panes/SplashScreen";
import TextureUtils from "./Textures/TextureUtils";
import { Project } from "./project/Project";

function randomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const randomIterator = () => chars[Math.floor(Math.random() * chars.length)];
	return Array.from({ length }, randomIterator).join("");
}

const loadPara = window.document.getElementById("loadingParagraph") as HTMLParagraphElement;
loadPara.textContent = "Initi UI...";
initUIClasses();

window.name = "Kayo Main";
loadPara.textContent = "Init WebGPU";
const gpux = await GPUX.requestGPUX();

if (typeof gpux === "string") {
	alert(`Could not initialize WebGPU with reason: ${gpux}`);
	throw new Error("Could not initialize WebGPU!", { cause: gpux });
}
TextureUtils.init(gpux);

loadPara.textContent = "Init WASM...";
const wasmx = await initWasmx();

const kayo = new Kayo(gpux, wasmx);
(window as any).kayo = kayo;
const beforeUnloadCallback = (_: any) => {
	if (kayo.windows.size > 1) kayo.closeAllSecondaryWindows(window);
};
window.addEventListener("beforeunload", beforeUnloadCallback);

const project = new Project(kayo, randomString(16));

const projectOpendCallback = () => {
	kayo.registerWindow(window, ViewportPane.getName(), true);
	window.document.body.appendChild(SplashScreen.createUIElement(window, kayo));
	window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
};
kayo.openProject(project, projectOpendCallback);
