import mat3 from "../math/mat3";
import { toRAD } from "../math/math";
import vec2 from "../math/vec2";
import vec3 from "../math/vec3";
import { MinecraftTexture } from "./MinecraftTexture";
import { ResourcePack } from "./ResourcePack";

export type VEC3 = [number, number, number];
export type BlockDisplay = { rotation: VEC3, translation: VEC3, scale: VEC3 };
export type BlockDisplayMode = "thirdperson_righthand" | "thirdperson_lefthand" | "firstperson_righthand" | "firstperson_lefthand" | "gui" | "head" | "ground" | "fixed";
export type ElementFace = "down" | "up" | "north" | "south" | "west" | "east";

type ParsedFace = {
	uv?: [number, number, number, number],
	texture: string | MinecraftTexture,
	cullface: ElementFace,
	rotation: 0 | 90 | 180 | 270,
	tintindex: number
}

export class ParsedBlockModelElement {

	from: VEC3;
	to: VEC3;
	rotation?: {
		origin: VEC3,
		axis: "x" | "y" | "z",
		angle: number,
		rescale: boolean
	}
	shade: boolean = true;
	faces: { [key in ElementFace]?: ParsedFace } = {};

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

class BuiltBlockModelElement{
	down?: BuiltFace;
	up?: BuiltFace;
	north?: BuiltFace;
	south?: BuiltFace;
	west?: BuiltFace;
	east?: BuiltFace;
	constructor(parsedElement: ParsedBlockModelElement, parsedBlockStateModel: ParsedBlockStateModel) {
		const faces = parsedElement.faces;
		for(const key in faces) {
			const faceKey = key as ElementFace;
			if(faces[faceKey])
				this[faceKey] = new BuiltFace(faces[faceKey], parsedElement, parsedBlockStateModel, faceKey);
		}
	}
}

class BuiltFace {
	uvOrigin: vec2;
	uvTangent: vec2;
	uvBitangent: vec2;
	geomOrigin: vec3;
	geomTangent: vec3;
	geomBitangent: vec3;
	texture?: MinecraftTexture;
	constructor(parsedFace: ParsedFace, parsedElement: ParsedBlockModelElement, parsedBlockStateModel: ParsedBlockStateModel, faceKey: ElementFace) {
		if(parsedFace.texture instanceof MinecraftTexture)
			this.texture = parsedFace.texture;
		const from = parsedElement.from;
		const to = parsedElement.to;

		if(parsedFace.uv) {
			this.uvOrigin = new vec2(parsedFace.uv[0], 16 - parsedFace.uv[1]).divS(16);
			this.uvTangent = new vec2(parsedFace.uv[2] - parsedFace.uv[0], 0).divS(16);
			this.uvBitangent = new vec2(0, -(parsedFace.uv[3] - parsedFace.uv[1])).divS(16);
		} else {
			this.uvOrigin = new vec2(0, 0);
			this.uvTangent = new vec2(1, 0);
			this.uvBitangent = new vec2(0, 1);
		}

		switch(parsedFace.rotation) {
			case 0: {
				break;
			}
			case 90:{
				this.uvOrigin = this.uvOrigin.add(this.uvBitangent);
				this.uvTangent = new vec2(-this.uvTangent.y, this.uvTangent.x);
				this.uvBitangent = new vec2(-this.uvBitangent.y, this.uvBitangent.x);
				break;
			}
			case 180:{
				this.uvOrigin = this.uvOrigin.add(this.uvTangent).add(this.uvBitangent);
				this.uvTangent = this.uvTangent.mulS(-1);
				this.uvBitangent = this.uvBitangent.mulS(-1);
				break;
			}
			case 270:{
				this.uvOrigin = this.uvOrigin.add(this.uvTangent);
				this.uvTangent = new vec2(this.uvTangent.y, -this.uvTangent.x);
				this.uvBitangent = new vec2(this.uvBitangent.y, -this.uvBitangent.x);
				break;
			}
		}

		switch (faceKey) {
			case "down": {
				this.geomOrigin = new vec3(from[0] / 16, from[1] / 16, to[2] / 16);
				this.geomTangent = new vec3((to[0] - from[0]) / 16, 0, 0);
				this.geomBitangent = new vec3(0, 0, (from[2] - to[2]) / 16);
				break;
			}
			case "up": {
				this.geomOrigin = new vec3(from[0] / 16, to[1] / 16, from[2] / 16);
				this.geomTangent = new vec3((to[0] - from[0]) / 16, 0, 0);
				this.geomBitangent = new vec3(0, 0, (to[2] - from[2]) / 16);
				break;
			}
			case "north": {
				this.geomOrigin = new vec3(to[0] / 16, to[1] / 16, from[2] / 16);
				this.geomTangent = new vec3((from[0] - to[0]) / 16, 0, 0);
				this.geomBitangent = new vec3(0, (from[1] - to[1]) / 16, 0);
				break;
			}
			case "south": {
				this.geomOrigin = new vec3(from[0] / 16, to[1] / 16, to[2] / 16);
				this.geomTangent = new vec3((to[0] - from[0]) / 16, 0, 0);
				this.geomBitangent = new vec3(0, (from[1] - to[1]) / 16, 0);
				break;
			}
			case "west": {
				this.geomOrigin = new vec3(from[0] / 16, to[1] / 16, from[2] / 16);
				this.geomTangent = new vec3(0, 0, (to[2] - from[2]) / 16);
				this.geomBitangent = new vec3(0, (from[1] - to[1]) / 16, 0);
				break;
			}
			case "east":{
				this.geomOrigin = new vec3(to[0] / 16, to[1] / 16, to[2] / 16);
				this.geomTangent = new vec3(0, 0, (from[2] - to[2]) / 16);
				this.geomBitangent = new vec3(0, (from[1] - to[1]) / 16, 0);
				break;
			}
		}

		if(parsedElement.rotation) {
			const rot = parsedElement.rotation;
			let rotMat: mat3;
			switch(rot.axis) {
				case "x": {
					rotMat = mat3.rotationX(toRAD(rot.angle));
					break;
				}
				case "y":{
					rotMat = mat3.rotationY(toRAD(rot.angle));
					break;
				}
				case "z":{
					rotMat = mat3.rotationZ(toRAD(rot.angle));
					break;
				}
			}
			const origin = new vec3(...rot.origin).divS(16);
			this.geomOrigin = rotMat.multVec(this.geomOrigin.sub(origin)).add(origin);
			this.geomTangent = rotMat.multVec(this.geomTangent);
			this.geomBitangent = rotMat.multVec(this.geomBitangent);
			if(rot.rescale) {
				this.geomOrigin = this.geomOrigin.apply(Math.round);
				this.geomTangent = this.geomTangent.apply(Math.round);
				this.geomBitangent = this.geomBitangent.apply(Math.round);
			}
		}

		if(parsedBlockStateModel.x) {
			let rotX: mat3;
			switch(parsedBlockStateModel.x) {
				case 90: {
					rotX = mat3.rotationX90();
					break;
				}
				case 180: {
					rotX = mat3.rotationX180();
					break;
				}
				case 270: {
					rotX = mat3.rotationX270();
					break;
				}
			}
			const origin = new vec3(0.5, 0.5, 0.5);
			this.geomOrigin = rotX.multVec(this.geomOrigin.sub(origin)).add(origin);
			this.geomTangent = rotX.multVec(this.geomTangent);
			this.geomBitangent = rotX.multVec(this.geomBitangent);
		}

		if(parsedBlockStateModel.y) {
			let rotY: mat3;
			switch(parsedBlockStateModel.y) {
				case 90: {
					rotY = mat3.rotationY90();
					break;
				}
				case 180: {
					rotY = mat3.rotationY180();
					break;
				}
				case 270: {
					rotY = mat3.rotationY270();
					break;
				}
			}
			const origin = new vec3(0.5, 0.5, 0.5);
			this.geomOrigin = rotY.multVec(this.geomOrigin.sub(origin)).add(origin);
			this.geomTangent = rotY.multVec(this.geomTangent);
			this.geomBitangent = rotY.multVec(this.geomBitangent);
		}
	}
}

export class ParsedBlockModel {
	name: string;
	parent: string = "";
	ambientocclusion = true;
	display: { [key in BlockDisplayMode]?: BlockDisplay } = {};
	textures: { [key: string]: MinecraftTexture | string } = {};
	elements: ParsedBlockModelElement[] = [];
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
					this.elements.push(new ParsedBlockModelElement(e));
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
				this.elements.push(new ParsedBlockModelElement(e));
		}
		else {
			for (const e of parent.elements)
				this.elements.push(new ParsedBlockModelElement(e));
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


}


class BuiltBlockModel {
	elements: BuiltBlockModelElement[] = [];
	constructor(parsedBlockStateModel: ParsedBlockStateModel) {
		const model = parsedBlockStateModel.model;
		for (const parsedElement of model.elements) {
			this.elements.push(new BuiltBlockModelElement(parsedElement, parsedBlockStateModel));
		}
	}

	public build(geom: number[], tex: number[], texIndex: number[], pos: vec3): number {
		let faceCount = 0;
		for (const element of this.elements) {
			for(const key in element) {
				const face = element[key as ElementFace];
				if(!face)
					continue
				geom.push(...face.geomOrigin.add(pos), ...face.geomTangent, ...face.geomBitangent);
				tex.push(...face.uvOrigin, ...face.uvTangent, ...face.uvBitangent);
				texIndex.push(face.texture ? face.texture.layer : 0);
				faceCount++;
			}
		}
		return faceCount;
	}
}

export class ParsedBlockStateModel {
	model: ParsedBlockModel;
	x: 0 | 90 | 180 | 270 = 0;
	y: 0 | 90 | 180 | 270 = 0;
	uvlock: boolean = false;
	weight: number = 1
	builtModel: BuiltBlockModel;

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
		this.builtModel = new BuiltBlockModel(this);
	}

	public build(geom: number[], tex: number[], texIndex: number[], x: number, y: number, z: number): number {
		return this.builtModel.build(geom, tex, texIndex, new vec3(x, y, z));
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
	variants?: ObjMap<ParsedBlockStateModel | ParsedBlockStateModel[]>;
	multipart?: {}[];

	constructor(res: ResourcePack, name: string, parsed: any) {
		this.name = name;
		if (parsed.variants !== undefined) {
			this.variants = new ObjMap<ParsedBlockStateModel | ParsedBlockStateModel[]>;
			for (const key in parsed.variants) {
				const mapKey = this.parseVariantKey(key);
				const value = parsed.variants[key];

				if (Array.isArray(value)) {
					const blockStateModelArray: ParsedBlockStateModel[] = [];
					this.variants.add(mapKey, blockStateModelArray);
					for (const obj of value) {
						blockStateModelArray.push(new ParsedBlockStateModel(res, obj));
					}
				} else {
					this.variants.add(mapKey, new ParsedBlockStateModel(res, value));
				}
			}
		};
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


	public getVariantByProperties(properties: any): ParsedBlockStateModel | ParsedBlockStateModel[] | undefined {
		if (!this.variants)
			return undefined;
		if (!properties)
			return this.variants.find({});
		return this.variants.find(properties);
	}

	public build(geom: number[], tex: number[], texIndex: number[], properties: any, x: number, y: number, z: number): number {
		if (!this.variants)
			return 0;

		const blockModels = this.getVariantByProperties(properties);
		const blockModel = Array.isArray(blockModels) ? blockModels[Math.floor(Math.random() * blockModels.length)] : blockModels;
		if (!blockModel)
			return 0;

		return blockModel.build(geom, tex, texIndex, x, y, z);
	}
}

// class BlockFace {
// 	isFullFace: boolean;
// 	isOpaque: boolean;
// 	name: string;
// 	constructor(name: string, isFullFace: boolean, isOpaque: boolean) {
// 		this.name = name;
// 		this.isOpaque = isOpaque;
// 		this.isFullFace = isFullFace;
// 	}
// }

// class MinecraftBlock {
// 	name: string;
// 	quads: ParsedBlockModelElement[] = [];
// 	northFace: BlockFace;
// 	eastFace: BlockFace;
// 	southFace: BlockFace;
// 	westFace: BlockFace;
// 	topFace: BlockFace;
// 	bottomFace: BlockFace;
// 	constructor(blockStateModel: BlockStateModel) {
// 		const model = blockStateModel.model;
// 		this.name = blockStateModel.model.name;
// 		for(const e in model.elements) {
// 			const element = new ParsedBlockModelElement
// 		}
// 	}
// }