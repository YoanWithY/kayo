import { ZipInfo } from "unzipit";
import { MinecraftTexture } from "./MinecraftTexture";
import { BlockModel, BlockState } from "./MinecraftBlock";
import { gpuDevice } from "../GPUX";

export class MinecraftNamespaceResources {
	namespace: string;
	blockstates: { [key: string]: BlockState } = {};
	models: any = {};
	textures: { [key: string]: { [key: string]: MinecraftTexture } } = {};
	constructor(namespace: string) {
		this.namespace = namespace;
	}
}

export class ResourcePack {
	name: string;
	namespaceResources: { [key: string]: MinecraftNamespaceResources };
	allBlockTextures!: GPUTexture;
	constructor(name: string) {
		this.name = name;
		this.namespaceResources = {};
	}

	getNamespace(namespaceName: string) {
		let namespace = this.namespaceResources[namespaceName];
		if (!namespace) {
			namespace = new MinecraftNamespaceResources(namespaceName);
			this.namespaceResources[namespaceName] = namespace;
		}
		return namespace;
	}

	getModelByURL(rl: string): BlockModel | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}
		const resPath = path.split("/");
		return this.getNamespace(namespacename).models[resPath[0]][resPath[1]];
	}

	getTextureByURL(rl: string): MinecraftTexture | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}
		const resPath = path.split("/");
		return this.getNamespace(namespacename).textures[resPath[0]][resPath[1]];
	}

	getBlockStateByURL(rl: string): BlockState | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}
		return this.getNamespace(namespacename).blockstates[path];
	}

	initialize() {
		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockModels = namespaceres.models.block;
			for (const b in blockModels) {
				(blockModels[b] as BlockModel).expandRecursevly(this);
			}
		}

		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockModels = namespaceres.models.block;
			for (const b in blockModels) {
				(blockModels[b] as BlockModel).resolveTextuers(this);
			}
		}

		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockstates = namespaceres.blockstates;
			for (const b in blockstates) {
				blockstates[b] = new BlockState(this, b, blockstates[b]);
			}
		}

		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blokTextures = namespaceres.textures.block;
			let blockTextureCount = 0;
			for (const _ in blokTextures)
				blockTextureCount++;

			this.allBlockTextures = gpuDevice.createTexture({
				format: "rgba8unorm",
				size: [16, 16, blockTextureCount],
				usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
				mipLevelCount: 5,
			});

			const copyEncoder = gpuDevice.createCommandEncoder({ label: "texture copy encoder" });
			let layer = 0;
			for (const t in blokTextures) {
				const tex = blokTextures[t];
				tex.layer = layer;
				for (let mip = 0; mip < 5; mip++) {
					const f = 1 << mip;
					copyEncoder.copyTextureToTexture(
						{
							texture: tex.gpuTexture,
							mipLevel: mip
						},
						{
							texture: this.allBlockTextures,
							mipLevel: mip,
							origin: [0, 0, layer]
						},
						{
							width: this.allBlockTextures.width / f,
							height: this.allBlockTextures.height / f,
							depthOrArrayLayers: 1,
						});
				}
				layer++;
			}
			gpuDevice.queue.submit([copyEncoder.finish()]);
		}
	}

	static parse(zip: ZipInfo, name: string, onDone: () => void, onProgress: (total: number, pending: number, name: string) => void): ResourcePack {
		const r = new ResourcePack(name);
		const entries = zip.entries;
		let pending = 0;
		let total = 0;

		const update = (key: string) => {
			pending--;
			onProgress(total, pending, key);
			if (pending === 0)
				onDone();
		};

		for (const key in entries) {
			const nameParts = key.split("/");
			const type = nameParts[2];


			switch (type) {
				case "blockstates": {
					const filename = nameParts[3];
					if (!filename || !filename.endsWith(".json"))
						continue;
					pending++;

					const namespace = r.getNamespace(nameParts[1]);
					entries[key].json().then(object => {
						namespace.blockstates[filename.substring(0, filename.length - 5)] = object;
						update(key);
					});

					break;
				}
				case "models": {
					const modelType = nameParts[3];
					const filename = nameParts[4];
					if (!filename || !filename.endsWith(".json"))
						continue;
					pending++;

					const namespace = r.getNamespace(nameParts[1]);
					let typeContainer = namespace.models[modelType];
					if (!typeContainer) {
						typeContainer = {};
						namespace.models[modelType] = typeContainer;
					}

					entries[key].json().then(object => {
						const blockName = filename.substring(0, filename.length - 5);
						typeContainer[blockName] = new BlockModel(blockName, object);
						update(key);
					})
					break;
				}
				case "textures": {
					const modelType = nameParts[3];
					const filename = nameParts[4];
					if (!filename || !filename.endsWith(".png"))
						continue;
					pending++;
					const namespace = r.getNamespace(nameParts[1]);
					let typeContainer = namespace.textures[modelType];
					if (!typeContainer) {
						typeContainer = {};
						namespace.textures[modelType] = typeContainer;
					}

					entries[key].blob('image/png').then(blob => {
						createImageBitmap(blob, { colorSpaceConversion: 'none' }).then(image => {
							const textureName = filename.substring(0, filename.length - 4);
							typeContainer[textureName] = new MinecraftTexture(textureName, image);
							update(key);
						})
					})
					break;
				}
			}
		}
		total = pending;
		return r;
	}

}