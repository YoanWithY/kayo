import { ImageData } from "../../c/KayoCorePP";
import { Kayo } from "../Kayo";
import { CreateAtlasTask } from "../ressourceManagement/CreateAtlasTask";
import { VirtualTexture2D } from "../Textures/VirtualTexture2D";

export class MinecraftTexture {
	public name: string;
	public virtualTexture?: VirtualTexture2D;

	public constructor(kayo: Kayo, name: string, imageData: ImageData) {
		this.name = name;

		const virtualTexture = kayo.virtualTextureSystem.allocateVirtualTexture(
			name,
			imageData.width,
			imageData.height,
			"clamp-to-edge",
			"clamp-to-edge",
			"linear",
			"nearest",
			"linear",
			false,
		);
		if (virtualTexture === undefined) return;

		const createAtlasFinishedCallbakc = (atlasData: { byteOffset: number; byteLength: number }) => {
			imageData.delete();
			const atlasMemoryView = kayo.wasmx.getMemoryView(atlasData.byteOffset, atlasData.byteLength);
			virtualTexture.makeResident(atlasMemoryView, 0, 0, 0);
			kayo.project.fullRerender();

			const svtWriteFinishedCallback = (writeResult: number) => {
				if (writeResult !== 0) {
					console.error(`SVT Write failed.`);
					return;
				}
				kayo.wasmx.wasm.deleteArrayUint8(atlasData.byteOffset);
			};
			virtualTexture.writeToFileSystem(atlasMemoryView, 0, 0, 0, svtWriteFinishedCallback);
		};

		const atlasTas = new CreateAtlasTask(kayo.wasmx, imageData, createAtlasFinishedCallbakc);
		kayo.wasmx.taskQueue.queueTask(atlasTas);
		this.virtualTexture = virtualTexture;
	}

	public isOpaque(): boolean {
		return true;
	}
}
