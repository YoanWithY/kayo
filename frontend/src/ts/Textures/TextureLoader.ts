import { VirtualTexture2D } from "./VirtualTexture2D";
import { Project } from "../project/Project";
import TextureUtils from "./TextureUtils";

export interface Texture2D {
	/**
	 * The unique id of the texture.
	 */
	uid: string,
	/**
	 * The width of the texture in texels.
	 */
	width: number,
	/**
	 * The height of the texture in texels.
	 */
	height: number,
	/**
	 * The sampling properies of the texture.
	 */
	samplingDescriptor: GPUSamplerDescriptor
}


export class TextureLoader {
	allTextures: { [i: string]: Texture2D }
	project: Project;

	constructor(project: Project) {
		this.project = project;
		this.allTextures = {};
	}

	public async loadTextureVirtual(url: string): Promise<VirtualTexture2D | undefined> {
		const bitmap = await TextureUtils.loadImageBitmap(url);
		const vtSystem = this.project.renderer.virtualTextureSystem;
		const virtualTexture = vtSystem.allocateVirtualTexture(url, bitmap.width, bitmap.height);
		if (virtualTexture === undefined)
			return undefined;

		this.allTextures[url] = virtualTexture;
		return virtualTexture;
	}
}