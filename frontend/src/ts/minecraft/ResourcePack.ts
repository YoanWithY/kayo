import { ZipInfo } from "unzipit";
import { MinecraftTexture } from "./MinecraftTexture";
import { ParsedBlockModel, BlockState } from "./MinecraftBlock";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { ImageData } from "../../c/KayoCorePP";
import { Kayo } from "../Kayo";

export class MinecraftNamespaceResources {
	public namespace: string;
	public blockstates: { [key: string]: BlockState } = {};
	public models: any = {};
	public textures: { [key: string]: { [key: string]: MinecraftTexture } } = {};
	public constructor(namespace: string) {
		this.namespace = namespace;
	}
}

export class ResourcePack {
	public fallback: ResourcePack | undefined;
	public name: string;
	public namespaceResources: { [key: string]: MinecraftNamespaceResources };
	public allBlockTextures!: GPUTexture;
	public constructor(name: string, fallback?: ResourcePack) {
		this.name = name;
		this.namespaceResources = {};
		this.fallback = fallback;
	}

	public getNamespace(namespaceName: string) {
		let namespace = this.namespaceResources[namespaceName];
		if (!namespace) {
			namespace = new MinecraftNamespaceResources(namespaceName);
			this.namespaceResources[namespaceName] = namespace;
		}
		return namespace;
	}

	public getModelByURL(rl: string): ParsedBlockModel | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}

		const resPath = path.split("/");
		const namespaceRes = this.getNamespace(namespacename);
		let ret: ParsedBlockModel | undefined = namespaceRes.models[resPath[0]][resPath[1]];
		if (!ret && this.fallback !== undefined) {
			ret = this.fallback.getModelByURL(rl);
			if (ret) {
				const bm = new ParsedBlockModel(resPath[1], ret.parsed);
				bm.prep(this);
				namespaceRes.models[resPath[0]][resPath[1]] = bm;
				ret = bm;
			}
		}
		return ret;
	}

	public getTextureByURL(rl: string): MinecraftTexture | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}
		const resPath = path.split("/");
		let ret: MinecraftTexture | undefined = this.getNamespace(namespacename).textures[resPath[0]][resPath[1]];
		if (!ret && this.fallback !== undefined) ret = this.fallback.getTextureByURL(rl);
		return ret;
	}

	public getBlockStateByURL(rl: string): BlockState | undefined {
		let namespacename = "minecraft";
		const parts = rl.split(":");
		let path = rl;
		if (parts.length === 2) {
			namespacename = parts[0];
			path = parts[1];
		}
		const namespaceRes = this.getNamespace(namespacename);
		let ret: BlockState | undefined = namespaceRes.blockstates[path];
		if (!ret && this.fallback !== undefined) {
			ret = this.fallback.getBlockStateByURL(rl);
			if (ret) {
				const bs = new BlockState(this, path, ret.parsed);
				namespaceRes.blockstates[path] = bs;
				ret = bs;
			}
		}
		return ret;
	}

	public initialize(virtualTextureSystem: VirtualTextureSystem) {
		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockModels = namespaceres.models.block;
			for (const b in blockModels) {
				(blockModels[b] as ParsedBlockModel).expandRecursevly(this);
			}
		}

		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockModels = namespaceres.models.block;
			for (const b in blockModels) {
				(blockModels[b] as ParsedBlockModel).resolveTextures(this);
			}
		}

		for (const namespaceName in this.namespaceResources) {
			const namespaceres = this.namespaceResources[namespaceName];
			const blockstates = namespaceres.blockstates;
			for (const b in blockstates) {
				blockstates[b] = new BlockState(this, b, blockstates[b]);
			}
		}
		virtualTextureSystem.physicalTexture.generateAllMips();
	}

	public static parse(
		kayo: Kayo,
		zip: ZipInfo,
		name: string,
		fallback: ResourcePack | undefined,
		onDone: () => void,
		onProgress: (total: number, pending: number, name: string) => void,
	): ResourcePack {
		const r = new ResourcePack(name, fallback);
		const entries = zip.entries;
		let pending = 0;
		let total = 0;

		const update = (key: string) => {
			pending--;
			onProgress(total, pending, key);
			if (pending === 0) onDone();
		};

		for (const key in entries) {
			const nameParts = key.split("/");
			const type = nameParts[2];

			switch (type) {
				case "blockstates": {
					const filename = nameParts[3];
					if (!filename || !filename.endsWith(".json")) continue;
					pending++;

					const namespace = r.getNamespace(nameParts[1]);
					entries[key].json().then((object) => {
						namespace.blockstates[filename.substring(0, filename.length - 5)] = object;
						update(key);
					});

					break;
				}
				case "models": {
					const modelType = nameParts[3];
					const filename = nameParts[4];
					if (!filename || !filename.endsWith(".json")) continue;
					pending++;

					const namespace = r.getNamespace(nameParts[1]);
					let typeContainer = namespace.models[modelType];
					if (!typeContainer) {
						typeContainer = {};
						namespace.models[modelType] = typeContainer;
					}

					entries[key].json().then((object) => {
						const blockName = filename.substring(0, filename.length - 5);
						typeContainer[blockName] = new ParsedBlockModel(blockName, object);
						update(key);
					});
					break;
				}
				case "textures": {
					const modelType = nameParts[3];
					const filename = nameParts[4];
					if (!filename || !filename.endsWith(".png")) continue;
					pending++;
					const namespace = r.getNamespace(nameParts[1]);
					let typeContainer = namespace.textures[modelType];
					if (!typeContainer) {
						typeContainer = {};
						namespace.textures[modelType] = typeContainer;
					}

					const textureName = filename.substring(0, filename.length - 4);
					entries[key].arrayBuffer().then((pngData) => {
						const imageData = kayo.wasmx.imageData.fromImageData(pngData, true) as ImageData;
						typeContainer[textureName] = new MinecraftTexture(kayo, textureName, imageData);
						update(key);
					});

					break;
				}
			}
		}
		total = pending;
		return r;
	}
}
