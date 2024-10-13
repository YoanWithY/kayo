import mat2 from "../math/mat2";
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
const elementFaceKeys: ElementFace[] = ["down", "up", "north", "east", "south", "west"];

type ParsedFace = {
	uv: [number, number, number, number],
	texture: string | MinecraftTexture,
	cullface: ElementFace,
	rotation: 0 | 90 | 180 | 270,
	tintindex: number
}

export type BlockNeighborhood = { [key in ElementFace]?: MinecraftBlock };

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

class BuiltBlockModelElement {
	down?: BuiltFace;
	up?: BuiltFace;
	north?: BuiltFace;
	south?: BuiltFace;
	west?: BuiltFace;
	east?: BuiltFace;
	isFullBlock: boolean;
	isOpaque: boolean = true;
	constructor(parsedElement: ParsedBlockModelElement, parsedBlockStateModel: ParsedBlockStateModel) {
		const faces = parsedElement.faces;
		for (const key of elementFaceKeys) {
			if (faces[key]) {
				const builtFace = new BuiltFace(faces[key], parsedElement, key);
				this[key] = builtFace;
				if (!builtFace.texture || !builtFace.texture.isOpaque())
					this.isOpaque = false;
			} else {
				this.isOpaque = false;
			}
		}
		const f = parsedElement.from;
		const t = parsedElement.to;
		this.isFullBlock = f[0] === 0 && f[1] === 0 && f[2] === 0 && t[0] === 16 && t[1] === 16 && t[2] === 16;


		if (parsedElement.rotation) {
			const rot = parsedElement.rotation;
			let rotMat: mat3;
			switch (rot.axis) {
				case "x": {
					rotMat = mat3.rotationX(toRAD(rot.angle));
					break;
				}
				case "y": {
					rotMat = mat3.rotationY(toRAD(rot.angle));
					break;
				}
				case "z": {
					rotMat = mat3.rotationZ(toRAD(rot.angle));
					break;
				}
			}
			const origin = new vec3(...rot.origin).divS(16);


			for (const key of elementFaceKeys) {
				const face = this[key];
				if (!face)
					continue;
				face.geomOrigin = rotMat.multVec(face.geomOrigin.sub(origin)).add(origin);
				face.geomTangent = rotMat.multVec(face.geomTangent);
				face.geomBitangent = rotMat.multVec(face.geomBitangent);
				if (rot.rescale) {
					face.geomOrigin = face.geomOrigin.apply(Math.round);
					face.geomTangent = face.geomTangent.apply(Math.round);
					face.geomBitangent = face.geomBitangent.apply(Math.round);
				}
			}
		}

		if (parsedBlockStateModel.x) {
			let rotX: mat3;
			switch (parsedBlockStateModel.x) {
				case 90: {
					rotX = mat3.rotationX90();
					let t = this.up;
					this.up = this.south;
					this.south = this.down;
					this.down = this.north;
					this.north = t;
					break;
				}
				case 180: {
					rotX = mat3.rotationX180();
					let t = this.up;
					this.up = this.down;
					this.down = t;
					t = this.north;
					this.north = this.south;
					this.south = t;
					break;
				}
				case 270: {
					rotX = mat3.rotationX270();
					let t = this.down;
					this.up = this.north;
					this.south = this.up;
					this.down = this.south;
					this.north = t;
					break;
				}
			}
			const origin = new vec3(0.5, 0.5, 0.5);
			for (const key of elementFaceKeys) {
				const face = this[key];
				if (!face)
					continue;

				face.geomOrigin = rotX.multVec(face.geomOrigin.sub(origin)).add(origin);
				face.geomTangent = rotX.multVec(face.geomTangent);
				face.geomBitangent = rotX.multVec(face.geomBitangent);
			}
		}

		if (parsedBlockStateModel.y) {
			let rotY: mat3;
			switch (parsedBlockStateModel.y) {
				case 90: {
					rotY = mat3.rotationY90();
					let t = this.north;
					this.north = this.west;
					this.west = this.south;
					this.south = this.east;
					this.east = t;
					break;
				}
				case 180: {
					rotY = mat3.rotationY180();
					let t = this.north;
					this.north = this.south;
					this.south = t;
					t = this.west;
					this.west = this.east;
					this.east = t;
					break;
				}
				case 270: {
					rotY = mat3.rotationY270();
					let t = this.north;
					this.north = this.east;
					this.east = this.south;
					this.south = this.west;
					this.west = t;
					break;
				}
			}
			const origin = new vec3(0.5, 0.5, 0.5);

			for (const key of elementFaceKeys) {
				const face = this[key];
				if (!face)
					continue;

				face.geomOrigin = rotY.multVec(face.geomOrigin.sub(origin)).add(origin);
				face.geomTangent = rotY.multVec(face.geomTangent);
				face.geomBitangent = rotY.multVec(face.geomBitangent);

				if (parsedBlockStateModel.uvlock) {
					if (key === "down") {
						let uvRot: mat2;
						switch (parsedBlockStateModel.y) {
							case 90: {
								uvRot = mat2.rotationZ90CW();
								break;
							}
							case 180: {
								uvRot = mat2.rotationZ180();
								break;
							}
							case 270: {
								uvRot = mat2.rotationZ270CW();
								break;
							}
						}
						face.uvOrigin = uvRot.multVec(face.uvOrigin.subS(0.5)).addS(0.5);
						face.uvTangent = uvRot.multVec(face.uvTangent);
						face.uvBitangent = uvRot.multVec(face.uvBitangent);
					} else if (key === "up") {
						let uvRot: mat2;
						switch (parsedBlockStateModel.y) {
							case 90: {
								uvRot = mat2.rotationZ90CW();
								break;
							}
							case 180: {
								uvRot = mat2.rotationZ180();
								break;
							}
							case 270: {
								uvRot = mat2.rotationZ270CW();
								break;
							}
						}
						face.uvOrigin = uvRot.multVec(face.uvOrigin.subS(0.5)).addS(0.5);
						face.uvTangent = uvRot.multVec(face.uvTangent);
						face.uvBitangent = uvRot.multVec(face.uvBitangent);
					}
				}
			}

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
	tint: boolean = false;
	constructor(parsedFace: ParsedFace, parsedElement: ParsedBlockModelElement, faceKey: ElementFace) {
		if (parsedFace.tintindex !== undefined)
			this.tint = parsedFace.tintindex !== -1;
		if (parsedFace.texture instanceof MinecraftTexture)
			this.texture = parsedFace.texture;
		const from = parsedElement.from;
		const to = parsedElement.to;


		this.uvOrigin = new vec2(parsedFace.uv[0], 16 - parsedFace.uv[1]).divS(16);
		this.uvTangent = new vec2(parsedFace.uv[2] - parsedFace.uv[0], 0).divS(16);
		this.uvBitangent = new vec2(0, -(parsedFace.uv[3] - parsedFace.uv[1])).divS(16);


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
			case "east": {
				this.geomOrigin = new vec3(to[0] / 16, to[1] / 16, to[2] / 16);
				this.geomTangent = new vec3(0, 0, (from[2] - to[2]) / 16);
				this.geomBitangent = new vec3(0, (from[1] - to[1]) / 16, 0);
				break;
			}
		}

		switch (parsedFace.rotation) {
			case 0: {
				break;
			}
			case 90: {
				this.uvOrigin = this.uvOrigin.add(this.uvBitangent);
				const b = this.uvBitangent;
				this.uvBitangent = this.uvTangent
				this.uvTangent = b.mulS(-1);
				break;
			}
			case 180: {
				this.uvOrigin = this.uvOrigin.add(this.uvTangent).add(this.uvBitangent);
				this.uvTangent = this.uvTangent.mulS(-1);
				this.uvBitangent = this.uvBitangent.mulS(-1);
				break;
			}
			case 270: {
				this.uvOrigin = this.uvOrigin.add(this.uvTangent);
				const t = this.uvTangent;
				this.uvTangent = this.uvBitangent
				this.uvBitangent = t.mulS(-1);
				break;
			}
		}
	}
}

export class ParsedBlockModel {
	name: string;
	parent: string = "";
	ambientocclusion = true;
	display: { [key in BlockDisplayMode]?: BlockDisplay } = {};
	textureStrings: { [key: string]: string } = {};
	textures: { [key: string]: MinecraftTexture } = {};
	elements: ParsedBlockModelElement[] = [];
	parsed: any;
	private _isExpand: boolean = false;
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
					this.textureStrings[tex] = this.parsed.textures[tex];
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

		for (const tex in parent.textureStrings) {
			this.textureStrings[tex] = parent.textureStrings[tex];
		}

		if (this.parsed.textures !== undefined) {
			for (const tex in this.parsed.textures) {
				this.textureStrings[tex] = this.parsed.textures[tex];
			}
		}
		this._isExpand = true;
	}

	private resolveTextureVariable(res: ResourcePack, key: string): MinecraftTexture | undefined {
		let value = this.textureStrings[key];

		if (!value)
			return undefined;

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

	public resolveTextures(res: ResourcePack) {
		for (const key in this.textureStrings)
			this.resolveTextureVariable(res, key);

		for (const e of this.elements) {
			const faces = e.faces;
			for (const faceKey in faces) {
				const faceName = faceKey as ElementFace;
				if (faces[faceName] !== undefined) {
					const tex = faces[faceName].texture;

					if (tex && !(tex instanceof MinecraftTexture)) {
						const mTex = this.textures[tex.substring(1)];
						if (mTex)
							faces[faceName].texture = mTex;
					}
				}
			}

			const from = e.from;
			const to = e.to;
			if (faces.down && !faces.down.uv)
				faces.down.uv = [from[0], 16 - to[2], to[0], 16 - from[2]];
			if (faces.up && !faces.up.uv)
				faces.up.uv = [from[0], from[2], to[0], to[2]];
			if (faces.north && !faces.north.uv)
				faces.north.uv = [16 - to[0], 16 - to[1], 16 - from[0], 16 - from[1]];
			if (faces.east && !faces.east.uv)
				faces.east.uv = [16 - to[2], 16 - to[1], 16 - from[2], 16 - from[1]];
			if (faces.south && !faces.south.uv)
				faces.south.uv = [from[0], 16 - to[1], to[0], 16 - from[1]];
			if (faces.west && !faces.west.uv)
				faces.west.uv = [from[2], 16 - to[1], to[2], 16 - from[1]];
		}
	}

	get isExpand(): boolean {
		return this._isExpand;
	}

	public prep(res: ResourcePack) {
		this.expandRecursevly(res);
		this.resolveTextures(res);
	}


}


class BuiltBlockModel {
	elements: BuiltBlockModelElement[] = [];
	constructor(parsedBlockStateModel: ParsedBlockStateModel) {
		const model = parsedBlockStateModel.model;
		for (const parsedElement of model.elements)
			this.elements.push(new BuiltBlockModelElement(parsedElement, parsedBlockStateModel));
	}

	public build(geom: number[], tex: number[], texIndex: number[], pos: vec3, n: BlockNeighborhood, useCulling: boolean): number {
		let faceCount = 0;
		for (const element of this.elements) {
			for (const key of elementFaceKeys) {
				const face = element[key as ElementFace];
				if (!face)
					continue
				const neighbor = n[key as ElementFace];
				if (useCulling && neighbor !== undefined && neighbor.isFullOpaque)
					continue;

				geom.push(...face.geomOrigin.add(pos), ...face.geomTangent, ...face.geomBitangent);
				tex.push(...face.uvOrigin, ...face.uvTangent, ...face.uvBitangent);
				texIndex.push(face.texture ? face.texture.layer : 0, face.tint ? 1 : 0);

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
		if (parsed.uvlock !== undefined)
			this.uvlock = parsed.uvlock;
		this.builtModel = new BuiltBlockModel(this);
	}

	public build(geom: number[], tex: number[], texIndex: number[], x: number, y: number, z: number, n: BlockNeighborhood, useCulling: boolean): number {
		return this.builtModel.build(geom, tex, texIndex, new vec3(x, y, z), n, useCulling);
	}
}

export class ObjMap<T> {
	keyValuePairs: { key: any, value: T }[] = [];

	add(key: any, value: T) {
		this.keyValuePairs.push({ key: key, value: value });
	}

	find(key: any): T | undefined {
		const res = this.keyValuePairs.filter((val) => {
			for (const subKey in val.key) {
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

class Matcher {
	matches(_: any): boolean {
		return true;
	}
}

class StateMatcher extends Matcher {
	key: string;
	values: string[];
	constructor(key: string, values: any) {
		super();
		this.key = key;
		if (typeof values == "string")
			this.values = values.split("|");
		else
			this.values = [values.toString()];
	}
	matches(properties: any): boolean {
		const propValue = properties[this.key];
		if (!propValue)
			return false;
		return this.values.includes(propValue);
	}
}

class OrMatcher extends Matcher {
	conditions: StateMatcher[][] = [];
	constructor(parsed: any) {
		super();
		for (const obj of parsed) {
			const smArray: StateMatcher[] = [];
			for (const key in obj)
				smArray.push(new StateMatcher(key, obj[key]));
			this.conditions.push(smArray);
		}
	}
	matches(properties: any): boolean {
		for (const smArr of this.conditions) {
			let matches = true;
			for (const m of smArr) {
				if (!m.matches(properties))
					matches = false;
			}
			if (!matches)
				continue;
			return true;
		}
		return false;
	}
}

class AndMatcher extends Matcher {
	conditions: StateMatcher[][] = [];
	constructor(parsed: any) {
		super();
		for (const obj of parsed) {
			const smArray: StateMatcher[] = [];
			for (const key in obj)
				smArray.push(new StateMatcher(key, obj[key]));
			this.conditions.push(smArray);
		}
	}
	matches(properties: any): boolean {
		for (const smArr of this.conditions) {
			for (const m of smArr) {
				if (!m.matches(properties))
					return false;
			}
		}
		return true;
	}
}

class MultiPartCase {
	apply: ParsedBlockStateModel | ParsedBlockStateModel[];
	when: Matcher;
	constructor(res: ResourcePack, parsed: any) {
		if (Array.isArray(parsed.apply)) {
			this.apply = [];
			for (const key in parsed.apply)
				this.apply.push(new ParsedBlockStateModel(res, parsed.apply[key]));
		} else {
			this.apply = new ParsedBlockStateModel(res, parsed.apply);
		}

		const parsedWhen = parsed.when;
		if (parsedWhen === undefined) {
			this.when = new Matcher();
			return;
		}

		const whenOR = parsedWhen.OR;
		if (whenOR !== undefined) {
			this.when = new OrMatcher(whenOR);
			return;
		}

		const whenAND = parsedWhen.AND;
		if (whenAND !== undefined) {
			this.when = new AndMatcher(whenAND);
			return;
		}

		const key = Object.keys(parsedWhen)[0];
		this.when = new StateMatcher(key, parsedWhen[key]);
	}
}

export class BlockState {
	name: string;
	variants?: ObjMap<ParsedBlockStateModel | ParsedBlockStateModel[]>;
	multipart?: MultiPartCase[];
	parsed: any;

	constructor(res: ResourcePack, name: string, parsed: any) {
		this.name = name;
		this.parsed = parsed;
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
			return;
		}

		if (parsed.multipart !== undefined) {
			this.multipart = [];
			for (const parsedMultipartCase of parsed.multipart)
				this.multipart.push(new MultiPartCase(res, parsedMultipartCase));
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


	public getBlockStateModelByProperties(properties: any): ParsedBlockStateModel[] | undefined {
		if (this.variants) {
			const models = this.variants.find(properties === undefined ? {} : properties)
			if (Array.isArray(models))
				return [models[Math.floor(Math.random() * models.length)]];
			else if (models !== undefined)
				return [models];
		}

		if (this.multipart) {
			const tempArray: ParsedBlockStateModel[] = [];
			for (const mpCase of this.multipart) {
				if (mpCase.when.matches(properties)) {
					const apply = mpCase.apply;
					if (Array.isArray(apply))
						tempArray.push(apply[Math.floor(Math.random() * apply.length)]);
					else
						tempArray.push(apply);
				}
			}
			return tempArray;
		}
		return undefined;
	}
}

export class MinecraftBlock {
	name: string;
	parsedBlockStateModels: ParsedBlockStateModel[];
	isFullOpaque: boolean;

	constructor(name: string, blockStateModels: ParsedBlockStateModel[]) {
		this.name = name;
		this.parsedBlockStateModels = blockStateModels;
		this.isFullOpaque = blockStateModels.find(m => (m.builtModel.elements.find(e => e.isFullBlock && e.isOpaque) !== undefined)) !== undefined;
	}

	build(geom: number[], tex: number[], texIndex: number[], x: number, y: number, z: number, n: BlockNeighborhood): number {
		let faceNumber = 0;
		for (const parsedBlockStateModel of this.parsedBlockStateModels)
			faceNumber += parsedBlockStateModel.build(geom, tex, texIndex, x, y, z, n, this.isFullOpaque);
		return faceNumber;
	}
}