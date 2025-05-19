import { KayoWASMInstance, KayoWASMMinecraftModule } from "./KayoCorePP";

declare var KayoWASM: any;
const mod = await KayoWASM();
class WASMX {
	Number;
	kayoInstance: KayoWASMInstance;
	minecraftModule: KayoWASMMinecraftModule;
	constructor() {
		this.Number = mod.KayoNumber;
		this.kayoInstance = new mod.KayoWASMInstance();
		this.minecraftModule = new mod.KayoWASMMinecraftModule(this.kayoInstance);
	}
}

const wasmx = new WASMX();

const N = wasmx.Number;

export default wasmx;
