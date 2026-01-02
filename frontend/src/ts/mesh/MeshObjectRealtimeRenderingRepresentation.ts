import { RealtimeData } from "../../c/KayoCorePP";
import { Kayo } from "../Kayo";
import { Representation } from "../project/Representation";
import RealtimeRenderable from "../rendering/RealtimeRenderable";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { MaterialRealtimeRenderingRepresentation } from "./MaterialRealtimeRenderingRepresentation";
import { MeshObject } from "./MeshObject";
import { MeshObjectRealtimeRenderingPipeline } from "./MeshObjectRealtimeRenderingPipeline";

export class MeshObjectRealtimeRenderingRepresentation
	extends Representation<RealtimeRenderer, MeshObject>
	implements RealtimeRenderable
{
	private _kayo: Kayo;
	private _positionBuffer: GPUBuffer | null = null;
	private _tangentSpaceBuffer: GPUBuffer | null = null;
	private _uvsBuffer: GPUBuffer | null = null;
	private _realtimeData!: RealtimeData;
	private _vertexBufferLayout: GPUVertexBufferLayout[];
	private _pipeline!: MeshObjectRealtimeRenderingPipeline;

	public constructor(kayo: Kayo, representationConcept: RealtimeRenderer, representationSubject: MeshObject) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._vertexBufferLayout = [];
		this._setup();
	}

	private _setup() {
		this._rebuildBuffers();
		this._updateVertexBufferLayout();
		for (let i = 0; i < this._representationSubject.mesh.materials.size(); i++) {
			let matName = this._representationSubject.mesh.materials.get(i);
			if (!matName) continue;

			// eslint-disable-next-line local/no-anonymous-arrow-function
			let material = this._kayo.project.scene.materials.find((m) => m.name == matName);
			if (!material) {
				console.warn(`No material named "${matName}"!`);
				matName = "default";
			}
			// eslint-disable-next-line local/no-anonymous-arrow-function
			material = this._kayo.project.scene.materials.find((m) => m.name == matName);
			if (!material) {
				console.error(`No material named ${matName}!`);
				continue;
			}

			const materialRealtimeRepresentation: MaterialRealtimeRenderingRepresentation | undefined =
				material.getRepresentation(this.representationConcept) as
					| MaterialRealtimeRenderingRepresentation
					| undefined;
			if (!materialRealtimeRepresentation) {
				console.error("No material realtime representation!");
				continue;
			}
			this._pipeline = materialRealtimeRepresentation.getOrCreatePipelineFor(this);
		}
	}

	private _rebuildBuffers() {
		const gpuDevice = this._kayo.gpux.gpuDevice;
		if (this._positionBuffer) this._positionBuffer.destroy();
		this._positionBuffer = null;
		if (this._uvsBuffer) this._uvsBuffer.destroy();
		this._uvsBuffer = null;
		if (this._tangentSpaceBuffer) this._tangentSpaceBuffer.destroy();
		this._tangentSpaceBuffer = null;
		this._realtimeData = new this._kayo.wasmx.wasm.RealtimeData(this._representationSubject.mesh);
		this._positionBuffer = gpuDevice.createBuffer({
			label: "Mesh Realtime Position",
			size: this._realtimeData.position.bytesTotal,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
		});
		const posPtr = this._realtimeData.position.data;

		gpuDevice.queue.writeBuffer(
			this._positionBuffer,
			0,
			this._kayo.wasmx.memory,
			posPtr.byteOffset,
			posPtr.byteLength,
		);

		this._tangentSpaceBuffer = gpuDevice.createBuffer({
			label: "Mesh Realtime tangent space buffer",
			size: this._realtimeData.tangentSpace.bytesTotal,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
		});
		const tanPtr = this._realtimeData.tangentSpace.data;

		gpuDevice.queue.writeBuffer(
			this._tangentSpaceBuffer,
			0,
			this._kayo.wasmx.memory,
			tanPtr.byteOffset,
			tanPtr.byteLength,
		);

		if (this._representationSubject.mesh.uvMaps.size() > 0) {
			this._uvsBuffer = gpuDevice.createBuffer({
				label: "Mesh Realtime UVs",
				size: this._realtimeData.uvs.bytesTotal,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			});
			const uvPtr = this._realtimeData.uvs.data;

			gpuDevice.queue.writeBuffer(
				this._uvsBuffer,
				0,
				this._kayo.wasmx.memory,
				uvPtr.byteOffset,
				uvPtr.byteLength,
			);
		}
	}

	private _updateVertexBufferLayout() {
		this._vertexBufferLayout = [];

		const posAttrib = [];
		for (let i = 0; i < this._realtimeData.position.attributes.size(); i++)
			posAttrib.push(this._realtimeData.position.attributes.get(i) as GPUVertexAttribute);
		this._vertexBufferLayout.push({
			arrayStride: this._realtimeData.position.arrayStride,
			attributes: posAttrib,
			stepMode: this._realtimeData.position.stepMode as GPUVertexStepMode,
		});

		const tanAttrib = [];
		for (let i = 0; i < this._realtimeData.tangentSpace.attributes.size(); i++)
			tanAttrib.push(this._realtimeData.tangentSpace.attributes.get(i) as GPUVertexAttribute);
		this._vertexBufferLayout.push({
			arrayStride: this._realtimeData.tangentSpace.arrayStride,
			attributes: tanAttrib,
			stepMode: this._realtimeData.tangentSpace.stepMode as GPUVertexStepMode,
		});

		if (this._representationSubject.mesh.uvMaps.size() > 0) {
			const uvAttrib = [];
			for (let i = 0; i < this._realtimeData.uvs.attributes.size(); i++)
				uvAttrib.push(this._realtimeData.uvs.attributes.get(i) as GPUVertexAttribute);
			this._vertexBufferLayout.push({
				arrayStride: this._realtimeData.uvs.arrayStride,
				attributes: uvAttrib,
				stepMode: this._realtimeData.uvs.stepMode as GPUVertexStepMode,
			});
		}
	}

	public get vertexBufferLayout() {
		return this._vertexBufferLayout;
	}

	public recordForwardRendering(renderPassEncoder: GPURenderPassEncoder) {
		renderPassEncoder.setBindGroup(0, this.representationConcept.bindGroup0);
		renderPassEncoder.setPipeline(this._pipeline.gpuPipeline);
		renderPassEncoder.setVertexBuffer(0, this._positionBuffer);
		renderPassEncoder.setVertexBuffer(1, this._tangentSpaceBuffer);
		renderPassEncoder.setVertexBuffer(2, this._uvsBuffer);
		renderPassEncoder.draw(this._realtimeData.position.numVertices);
	}
}
