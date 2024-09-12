import { HeightFieldPipeline } from "./HeightFieldPipeline";
import { openProject } from "../project/Project";
import R3Object from "../project/R3Object";

export default class HeightFieldR3 extends R3Object {
	pipeline: HeightFieldPipeline;
	xVerts: number;
	yVerts: number;
	constructor(xVerts: number = 100, yVerts: number = 100) {
		super();
		this.xVerts = xVerts;
		this.yVerts = yVerts;
		this.pipeline = new HeightFieldPipeline("Height Field Material", openProject.renderer.bindGroup0Layout);
	}

	getVerts(): number {
		return this.xVerts * this.yVerts + this.xVerts * (this.yVerts - 2) + 2 * this.yVerts - 2;
	}
}