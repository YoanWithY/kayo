import { MainModule } from "../c/KayoCorePP";
import WASMX from "./WASMX";

declare var KayoWASM: any;
const mod: MainModule = await KayoWASM();
const wasmx = new WASMX(mod);
export default wasmx;
