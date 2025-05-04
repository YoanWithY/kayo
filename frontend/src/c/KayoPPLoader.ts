import Module, { KayoWASMInstance, KayoWASMMinecraftModule } from "./KayoCorePP";
const wasmInstance = await Module();

class WASMX {
	kayoInstance: KayoWASMInstance;
	minecraftModule: KayoWASMMinecraftModule;
	constructor() {
		this.kayoInstance = new wasmInstance.KayoWASMInstance();
		this.minecraftModule = new wasmInstance.KayoWASMMinecraftModule(this.kayoInstance);
	}
}

const wasmx = new WASMX();
export default wasmx;
