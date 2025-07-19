import KayoWASM from "../../c/KayoCorePP";
import WASMX from "../WASMX";

export default async function createWasmx() {
	return new WASMX(await KayoWASM());
}
