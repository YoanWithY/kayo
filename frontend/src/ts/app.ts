import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { PageContext } from "./PageContext";
import wasmx from "../c/KayoPPLoader";

initUIClasses();

if (window.opener === null) {
	window.name = "Kayo Main";
	const gpux = await initGPU();
	if (typeof gpux === "string") {
		alert(`Could not initialize WebGPU with reason: ${gpux}`);
		throw new Error("Could not initialize WebGPU!", { cause: gpux });
	}

	wasmx;

	(window as any).pageContext = new PageContext(gpux);
} else {
	window.name = "Kayo Sub";
	const pageContext = window.opener.pageContext as PageContext;
	pageContext.project.requestUI(window);
}
