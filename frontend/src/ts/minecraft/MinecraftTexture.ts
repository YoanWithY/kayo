import { ImageData } from "../../c/KayoCorePP";
import { Project } from "../project/Project";
import { CreateAtlasTask } from "../ressourceManagement/CreateAtlasTask";
import { VirtualTexture2D } from "../Textures/VirtualTexture2D";

export class MinecraftTexture {
	public name: string;
	public virtualTexture?: VirtualTexture2D;

	public constructor(project: Project, name: string, imageData: ImageData) {
		this.name = name;

		const virtualTexture = project.virtualTextureSystem.allocateVirtualTexture(
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
			const atlasMemoryView = project.wasmx.getMemoryView(atlasData.byteOffset, atlasData.byteLength);
			virtualTexture.makeResident(atlasMemoryView, 0, 0, 0);
			project.fullRerender();

			const svtWriteFinishedCallback = (writeResult: number) => {
				if (writeResult !== 0) {
					console.error(`SVT Write failed.`);
					return;
				}
				project.wasmx.wasm.deleteArrayUint8(atlasData.byteOffset);
			};
			virtualTexture.writeToFileSystem(atlasMemoryView, 0, 0, 0, svtWriteFinishedCallback);
		};

		const atlasTas = new CreateAtlasTask(project.wasmx, imageData, createAtlasFinishedCallbakc);
		project.wasmx.taskQueue.queueTask(atlasTas);
		this.virtualTexture = virtualTexture;
	}

	public isOpaque(): boolean {
		return true;
	}
}
