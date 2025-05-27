import KayoWASM from "../c/KayoCorePP";
import WASMX from "./WASMX";

const mod = await KayoWASM();
const wasmx = new WASMX(mod);
export default wasmx;
