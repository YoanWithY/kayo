import { GPUX } from "../GPUX";
import { Representation } from "../project/Representation";
import RealtimeRenderable from "../rendering/RealtimeRenderable";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { MeshObject } from "./MeshObject";
import { MeshObjectRealtimeRenderingPipeline } from "./MeshObjectRealtimeShader";

export class MeshObjectRealtimeRenderingRepresentation
	extends Representation<RealtimeRenderer, MeshObject>
	implements RealtimeRenderable
{
	private _shaderssToTriangles = new Map<MeshObjectRealtimeRenderingPipeline, [number, number][]>();
	private _vertexBuffer: GPUBuffer;

	public constructor(gpux: GPUX, representationConcept: RealtimeRenderer, representationSubject: MeshObject) {
		super(representationConcept, representationSubject);
		this._vertexBuffer = gpux.gpuDevice.createBuffer({
			size: 0,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
		});
	}

	public recordForwardRendering(renderPassEncoder: GPURenderPassEncoder) {
		renderPassEncoder.setBindGroup(0, this.representationConcept.bindGroup0);
		for (const [pipeline, trinagelRanges] of this._shaderssToTriangles.entries()) {
			renderPassEncoder.setPipeline(pipeline.gpuPipeline);
			renderPassEncoder.setVertexBuffer(0, this._vertexBuffer);
			for (const range of trinagelRanges) {
				renderPassEncoder.draw(range[1] - range[0], 0, range[0]);
			}
		}
	}
}
