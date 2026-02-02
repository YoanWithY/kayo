/* eslint-disable local/no-await */
import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./ressourceManagement/KayoWasmLoader";
import { GPUX } from "./GPUX";
import { SplashScreen } from "./ui/panes/SplashScreen";
import TextureUtils from "./Textures/TextureUtils";

const loadPara = window.document.getElementById("loadingParagraph") as HTMLParagraphElement;
loadPara.textContent = "Initi UI...";
initUIClasses();

window.name = "Kayo Main";
loadPara.textContent = "Init WebGPU";
const gpux = await GPUX.requestGPUX();

if (typeof gpux === "string") {
	loadPara.textContent = "Your browser does not support Kayo!";
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

const kayoLoadingScreen = window.document.getElementById("kayoLoading") as HTMLDivElement;
const onKayoInit = () => {
	kayo.cleanUpFileSystem();
	window.document.body.appendChild(SplashScreen.createUIElement(window, kayo, kayoLoadingScreen));
	window.document.body.removeChild(kayoLoadingScreen);
}
const onKayoInitError = () => {
	alert("Kayo could not initialize the File system. Your Browser or Browsersetting may be incompatible.")
}
loadPara.textContent = "Init Kayo...";
kayo.init(onKayoInit, onKayoInitError);

