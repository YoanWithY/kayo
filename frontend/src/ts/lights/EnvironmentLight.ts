import R3Object from "../project/R3Object";

export class EnvironmentLight extends R3Object {
	public renderDepth(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}
	public render(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}
	public renderSelection(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}

	public updateGPU(): void {
		throw new Error("Method not implemented.");
	}
}
