import { HeightFieldPipeline } from "./HeightFieldPipeline";
import { Project } from "../project/Project";
import R3Object from "../project/R3Object";

export default class HeightFieldR3 extends R3Object {
	pipeline: HeightFieldPipeline;
	xVerts: number;
	yVerts: number;
	constructor(project: Project, xVerts: number = 1000, yVerts: number = 1000) {
		super();
		this.xVerts = xVerts;
		this.yVerts = yVerts;
		this.pipeline = new HeightFieldPipeline(project, "Height Field Material");
	}

	getVerts(): number {
		return this.xVerts * this.yVerts + this.xVerts * (this.yVerts - 2) + 2 * this.yVerts - 2;
	}
}