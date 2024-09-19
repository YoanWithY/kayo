import { HeightFieldPipeline } from "./HeightFieldPipeline";
import { Project } from "../../project/Project";
import R3Object from "../../project/R3Object";
import { HeightFieldSelectionPipeline } from "./HeightFieldSelectionPipeline";

export default class HeightFieldR3 extends R3Object {
	pipeline: HeightFieldPipeline;
	selectionPipeline: HeightFieldSelectionPipeline;
	xVerts: number;
	yVerts: number;
	constructor(project: Project, xVerts: number = 1000, yVerts: number = 1000) {
		super(project);
		this.xVerts = xVerts;
		this.yVerts = yVerts;
		this.pipeline = new HeightFieldPipeline(project, "Height Field Pipeline");
		this.selectionPipeline = new HeightFieldSelectionPipeline(project, "Height Field Selection Pieline");
	}

	getVerts(): number {
		return this.xVerts * this.yVerts + this.xVerts * (this.yVerts - 2) + 2 * this.yVerts - 2;
	}

	render(renderPassEncoder: GPURenderPassEncoder): void {
		renderPassEncoder.setPipeline(this.pipeline.gpuPipeline);
		this.updateUniforms();
		renderPassEncoder.setBindGroup(1, this.defaultBindGroup);
		renderPassEncoder.draw(this.getVerts());
	}

	renderSelection(renderPassEncoder: GPURenderPassEncoder): void {
		renderPassEncoder.setPipeline(this.selectionPipeline.gpuPipeline);
		this.updateUniforms();
		renderPassEncoder.setBindGroup(1, this.defaultBindGroup);
		renderPassEncoder.draw(this.getVerts());
	}
}