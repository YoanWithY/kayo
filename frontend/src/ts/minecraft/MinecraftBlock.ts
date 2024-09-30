import { MinecraftTexture } from "./MinecraftTexture";
import { ResourcePack } from "./ResourcePack";

export type VEC3 = [number, number, number];
export type BlockDisplay = { rotation: VEC3, translation: VEC3, scale: VEC3 };
export type BlockDisplayMode = "thirdperson_righthand" | "thirdperson_lefthand" | "firstperson_righthand" | "firstperson_lefthand" | "gui" | "head" | "ground" | "fixed";
export type ElementFace = "down" | "up" | "north" | "south" | "west" | "east";

export type Face = {
	uv: [number, number, number, number],
	texture: string | MinecraftTexture,
	cullface: ElementFace,
	rotation: number,
	tintindex: number
}

export class BlockModelElement {

	from: VEC3;
	to: VEC3;
	rotation?: {
		origin: VEC3,
		axis: "x" | "y" | "z",
		angle: number,
		rescale: boolean
	}
	shade: boolean = true;
	faces: { [key in ElementFace]?: Face } = {};

	constructor(parse: any) {
		this.from = parse.from;
		this.to = parse.to;
		this.rotation = parse.rotation;
		if (parse.shade !== undefined)
			this.shade = parse.shade;

		for (const faceKey in parse.faces) {
			const parentFace = parse.faces[faceKey];
			const newFace: any = {};
			for (const parentFaceKey in parentFace)
				newFace[parentFaceKey] = parentFace[parentFaceKey];
			this.faces[faceKey as ElementFace] = newFace;
		}

	}
}

export class BlockModel {
	name: string;
	parent: string = "";
	ambientocclusion = true;
	display: { [key in BlockDisplayMode]?: BlockDisplay } = {};
	textures: { [key: string]: MinecraftTexture | string } = {};
	elements: BlockModelElement[] = [];
	parsed: any;
	constructor(name: string, parsed: any) {
		this.name = name;
		this.parsed = parsed;
	}

	public expandRecursevly(resourcePack: ResourcePack) {
		if (this.isExpand)
			return;

		const parentName = this.parsed.parent;
		if (parentName === undefined || parentName === "") {
			if (this.parsed.ambientocclusion !== undefined)
				this.ambientocclusion = this.parsed.ambientocclusion;

			if (this.parsed.display !== undefined)
				this.display = this.parsed.display;

			if (this.parsed.elements !== undefined) {
				for (const e of this.parsed.elements)
					this.elements.push(new BlockModelElement(e));
			}

			if (this.parsed.textures !== undefined) {
				for (const tex in this.parsed.textures) {
					this.textures[tex] = this.parsed.textures[tex];
				}
			}
			return;
		}

		this.parent = parentName;
		const parent = resourcePack.getModelByURL(parentName);
		if (!parent) {
			console.error("could not find parent");
			return;
		}

		if (!parent.isExpand)
			parent.expandRecursevly(resourcePack);

		if (this.parsed.ambientocclusion !== undefined)
			this.ambientocclusion = this.parsed.ambientocclusion;
		else
			this.ambientocclusion = parent.ambientocclusion;

		if (this.parsed.display !== undefined)
			this.display = this.parsed.display;
		else
			this.display = parent.display;

		if (this.parsed.elements !== undefined) {
			for (const e of this.parsed.elements)
				this.elements.push(new BlockModelElement(e));
		}
		else {
			for (const e of parent.elements)
				this.elements.push(new BlockModelElement(e));
		}

		for (const tex in parent.textures) {
			this.textures[tex] = parent.textures[tex];
		}

		if (this.parsed.textures !== undefined) {
			for (const tex in this.parsed.textures) {
				this.textures[tex] = this.parsed.textures[tex];
			}
		}
		this.parsed = undefined;
	}

	private resolveTextureVariable(res: ResourcePack, key: string): MinecraftTexture | undefined {
		let value = this.textures[key];

		if (!value)
			return undefined;

		if (value instanceof MinecraftTexture)
			return value;

		if (value[0] === "#" && value.length > 1) {
			const variableName = value.substring(1);

			if (key == variableName)
				return undefined;

			const mt = this.resolveTextureVariable(res, variableName);
			if (!mt)
				return undefined;

			this.textures[key] = mt;
			return mt;
		}

		const mt = res.getTextureByURL(value);
		if (!mt)
			return undefined;
		this.textures[key] = mt;
		return mt;
	}

	public resolveTextuers(res: ResourcePack) {
		for (const key in this.textures)
			this.resolveTextureVariable(res, key);

		for (const e of this.elements) {
			const faces = e.faces;
			for (const faceKey in faces) {
				const faceName = faceKey as ElementFace;
				if (faces[faceName] !== undefined) {
					const tex = faces[faceName].texture;

					if (tex && !(tex instanceof MinecraftTexture))
						faces[faceName].texture = this.textures[tex.substring(1)] as MinecraftTexture;
				}
			}

			const from = e.from;
			const to = e.to;
			if (faces.down && !faces.down.uv)
				faces.down.uv = [from[0], from[1], to[0], to[1]];
			if (faces.up && !faces.up.uv)
				faces.up.uv = [from[0], from[1], to[0], to[1]];
			if (faces.north && !faces.north.uv)
				faces.north.uv = [from[0], from[1], to[0], to[1]];
			if (faces.east && !faces.east.uv)
				faces.east.uv = [from[0], from[1], to[0], to[1]];
			if (faces.south && !faces.south.uv)
				faces.south.uv = [from[0], from[1], to[0], to[1]];
			if (faces.west && !faces.west.uv)
				faces.west.uv = [from[0], from[1], to[0], to[1]];

		}
	}

	get isExpand(): boolean {
		return this.parsed === undefined;
	}

	public build(geom: number[], tex: number[], texIndex: number[], x: number, y: number, z: number): number {
		let faceCount = 0;
		for (const element of this.elements) {
			const from = element.from;
			const to = element.to;
			const faces = element.faces;

			if (faces.down) {
				faceCount++;
				geom.push(
					x + from[0] / 16, y + from[1] / 16, z + from[2] / 16,
					(to[0] - from[0]) / 16, 0, 0,
					0, 0, (to[2] - from[2]) / 16);
				const uv = faces.down.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.down.texture as MinecraftTexture).layer);
			}

			if (faces.up) {
				faceCount++;
				geom.push(
					x + to[0] / 16, y + to[1] / 16, z + from[2] / 16,
					(from[0] - to[0]) / 16, 0, 0,
					0, 0, (to[2] - from[2]) / 16);
				const uv = faces.up.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.up.texture as MinecraftTexture).layer);
			}

			if (faces.north) {
				faceCount++;
				geom.push(
					x + to[0] / 16, y + from[1] / 16, z + from[2] / 16,
					(from[0] - to[1]) / 16, 0, 0,
					0, (to[1] - from[1]) / 16, 0);
				const uv = faces.north.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.north.texture as MinecraftTexture).layer);
			}

			if (faces.east) {
				faceCount++;
				geom.push(
					x + to[0] / 16, y + from[1] / 16, z + to[2] / 16,
					0, 0, (from[2] - to[2]) / 16,
					0, (to[1] - from[1]) / 16, 0);
				const uv = faces.east.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.east.texture as MinecraftTexture).layer);
			}

			if (faces.south) {
				faceCount++;
				geom.push(
					x + from[0] / 16, y + from[1] / 16, z + to[2] / 16,
					(to[0] - from[0]) / 16, 0, 0,
					0, (to[1] - from[1]) / 16, 0);
				const uv = faces.south.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.south.texture as MinecraftTexture).layer);
			}

			if (faces.west) {
				faceCount++;
				geom.push(
					x + from[0] / 16, y + from[1] / 16, z + from[2] / 16,
					0, 0, (to[0] - from[0]) / 16,
					0, (to[1] - from[1]) / 16, 0);
				const uv = faces.west.uv;
				tex.push(uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16);
				texIndex.push((faces.west.texture as MinecraftTexture).layer);
			}


		}
		return faceCount;
	}
}


export class BlockStateModel {
	model: BlockModel;
	x: number = 0;
	y: number = 0;
	uvlock: boolean = false;
	weight: number = 1

	constructor(res: ResourcePack, parsed: any) {
		if (parsed.model === undefined)
			throw new Error("No model path.");
		const m = res.getModelByURL(parsed.model);
		if (!m)
			throw new Error("Model is undefined");
		this.model = m;
		if (parsed.x !== undefined)
			this.x = parsed.x;
		if (parsed.y !== undefined)
			this.y = parsed.y;
		if (parsed.weight !== undefined)
			this.weight = parsed.weight;
	}

	public build(geom: number[], tex: number[], texIndex: number[], x: number, y: number, z: number): number {
		return this.model.build(geom, tex, texIndex, x, y, z)
	}
}

export class ObjMap<T> {
	keyValuePairs: { key: any, value: T }[] = [];

	add(key: any, value: T) {
		this.keyValuePairs.push({ key: key, value: value });
	}

	find(key: any): T | undefined {
		const res = this.keyValuePairs.filter((val) => {
			for (const subKey in key) {
				if (val.key[subKey] !== key[subKey])
					return false
			}
			return true;
		});
		if (res.length >= 1)
			return res[0].value;
		return undefined;
	}
}

export class BlockState {
	name: string;
	variants!: ObjMap<BlockStateModel | BlockStateModel[]>;
	multipart!: {}[];

	constructor(res: ResourcePack, name: string, parsed: any) {
		this.name = name;
		if (parsed.variants !== undefined) {
			this.variants = new ObjMap<BlockStateModel | BlockStateModel[]>
		};

		for (const key in parsed.variants) {
			const mapKey = this.parseVariantKey(key);
			const value = parsed.variants[key];

			if (Array.isArray(value)) {
				const blockStateModelArray: BlockStateModel[] = [];
				this.variants.add(mapKey, blockStateModelArray);
				for (const obj of value) {
					blockStateModelArray.push(new BlockStateModel(res, obj));
				}
			} else {
				this.variants.add(mapKey, new BlockStateModel(res, value));
			}
		}
	}

	public parseVariantKey(key: string): any {
		if (key === undefined || key === "")
			return {};

		const objs = key.split(",");
		const ret: any = {};
		for (const obj of objs) {
			const keyVal = obj.split("=");
			ret[keyVal[0]] = keyVal[1];
		}
		return ret;
	}


	public getVariantByProperties(properties: any): BlockStateModel | BlockStateModel[] | undefined {
		if (!properties)
			return this.variants.find({});
		return this.variants.find(properties);
	}

	public build(geom: number[], tex: number[], texIndex: number[], properties: any, x: number, y: number, z: number): number {
		if (!this.variants)
			return 0;

		const blockModels = this.getVariantByProperties(properties);
		const blockModel = Array.isArray(blockModels) ? blockModels[0] : blockModels;
		if (!blockModel)
			return 0;

		return blockModel.build(geom, tex, texIndex, x, y, z);
	}
}