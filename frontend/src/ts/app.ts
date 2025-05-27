import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import wasmx from "./KayoWasmLoader";

initUIClasses();

if (window.opener === null) {
	window.name = "Kayo Main";
	const gpux = await initGPU();
	if (typeof gpux === "string") {
		alert(`Could not initialize WebGPU with reason: ${gpux}`);
		throw new Error("Could not initialize WebGPU!", { cause: gpux });
	}

	(window as any).kayo = new Kayo(gpux, wasmx);
} else {
	window.name = "Kayo Sub";
	const kayo = window.opener.kayo as Kayo;
	kayo.project.requestUI(window);
}
