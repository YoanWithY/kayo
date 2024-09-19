import R3Object from "../project/R3Object";

export class EnvironmentLight extends R3Object {
    render(renderPassEncoder: GPURenderPassEncoder): void {
        renderPassEncoder;
        throw new Error("Method not implemented.");
    }
    renderSelection(renderPassEncoder: GPURenderPassEncoder): void {
        renderPassEncoder;
        throw new Error("Method not implemented.");
    }

    updateGPU(): void {
        throw new Error("Method not implemented.");
    }

}