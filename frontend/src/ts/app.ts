import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./KayoWasmLoader";

const loadPara = window.document.getElementById("loadingParagraph") as HTMLParagraphElement;
loadPara.textContent = "Initi UI...";
initUIClasses();

if (window.opener === null) {
	window.name = "Kayo Main";
	loadPara.textContent = "Initi WebGPU";
	const gpux = await initGPU();
	if (typeof gpux === "string") {
		alert(`Could not initialize WebGPU with reason: ${gpux}`);
		throw new Error("Could not initialize WebGPU!", { cause: gpux });
	}

	loadPara.textContent = "Initi WASM...";
	const wasmx = await initWasmx();
	(window as any).kayo = new Kayo(gpux, wasmx);

	loadPara.textContent = "GO";
	setTimeout(() => {
		window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
	}, 50);
} else {
	loadPara.textContent = "Link to Kayo Instance...";
	window.name = "Kayo Sub";
	const kayo = window.opener.kayo as Kayo;
	if (!kayo) close();
	kayo.project.requestUI(window);

	loadPara.textContent = "GO";
	setTimeout(() => {
		window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
	}, 40);
}
