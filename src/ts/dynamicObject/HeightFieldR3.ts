import { HeightFieldMaterial } from "../Material/HeightFieldMaterial";
import R3Object from "../project/R3Object";

export default class HeightFieldR3 extends R3Object {
	material: HeightFieldMaterial;
	xVerts: number;
	yVerts: number;
	constructor(xVerts: number = 20, yVerts: number = 20) {
		super();
		this.xVerts = xVerts;
		this.yVerts = yVerts;
		this.material = new HeightFieldMaterial("Height Field Material");
	}

	getVerts(): number {
		return this.xVerts * this.yVerts + this.xVerts * (this.yVerts - 2) + this.yVerts - 1;
	}
}