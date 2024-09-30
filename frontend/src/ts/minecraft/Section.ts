import { gpuDevice } from "../GPUX";
import { minecraftBindgroup1Layout } from "./MinecraftOpaquePipeline";
import { ResourcePack } from "./ResourcePack";

export class Section {
	ressourcePack: ResourcePack;
	dimension: number;
	x: number;
	y: number;
	z: number;
	geomBuffer!: GPUBuffer;
	texBuffer!: GPUBuffer;
	texIndexBuffer!: GPUBuffer;
	sectionBuffer: GPUBuffer;
	faceNumber: number = 0;
	bindGroup1: GPUBindGroup;

	constructor(resoucePack: ResourcePack, dimension: number, x: number, y: number, z: number, palette: any, yzxIndices: Uint16Array) {
		this.dimension = dimension;
		this.x = x;
		this.y = y;
		this.z = z;
		this.ressourcePack = resoucePack;
		this.build(palette, yzxIndices);
		this.sectionBuffer = gpuDevice.createBuffer({
			label: "section uniform buffer",
			size: 4 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		gpuDevice.queue.writeBuffer(this.sectionBuffer, 0, new Float32Array([x * 16, y * 16, z * 16]));
		this.bindGroup1 = gpuDevice.createBindGroup({
			label: "section bind group 1",
			entries: [{ binding: 0, resource: { buffer: this.sectionBuffer } }],
			layout: minecraftBindgroup1Layout
		});
	}

	private build(palette: any, yzxIndices: Uint16Array) {
		let i = 0;
		const geom: number[] = [];
		const tex: number[] = [];
		const texIndex: number[] = [];
		for (let y = 0; y < 16; y++) {
			for (let z = 0; z < 16; z++) {
				for (let x = 0; x < 16; x++) {
					const paletteIndex = yzxIndices[i];
					const block = palette[paletteIndex];
					const blockState = this.ressourcePack.getBlockStateByURL(block.Name);
					if (!blockState)
						throw new Error(`Blockstate of Block ${block} is unknown.`);

					this.faceNumber += blockState.build(geom, tex, texIndex, block.Properties, x, y, z);
					i++;
				}
			}
		}
		const geomData = new Float32Array(geom);
		this.geomBuffer = gpuDevice.createBuffer({
			label: "section geom buffer",
			size: geomData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.geomBuffer, 0, geomData);

		const texData = new Float32Array(tex);
		this.texBuffer = gpuDevice.createBuffer({
			label: "section tex buffer",
			size: texData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.texBuffer, 0, texData);

		const texIndexData = new Uint32Array(texIndex);
		this.texIndexBuffer = gpuDevice.createBuffer({
			label: "section tex index buffer",
			size: texIndexData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.texIndexBuffer, 0, texIndexData);
	}

	render(renderPassEncoder: GPURenderPassEncoder) {
		renderPassEncoder.setVertexBuffer(0, this.geomBuffer);
		renderPassEncoder.setVertexBuffer(1, this.texBuffer);
		renderPassEncoder.setVertexBuffer(2, this.texIndexBuffer);
		renderPassEncoder.setBindGroup(1, this.bindGroup1);
		renderPassEncoder.draw(4, this.faceNumber);
	}
}