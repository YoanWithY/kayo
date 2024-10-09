import { gpuDevice } from "../GPUX";
import { ParsedBlockStateModel } from "./MinecraftBlock";
import { minecraftBindgroup1Layout } from "./MinecraftOpaquePipeline";
import { MinecraftWorld, PaletteEntry } from "./MinecraftWorld";
export class MultiBlockStateSection implements MultiBlockStateSection {
	minecraftWorld: MinecraftWorld;
	dimension: number;
	x: number;
	y: number;
	z: number;
	palette: PaletteEntry[];
	blockStates: ParsedBlockStateModel[][][];
	geomBuffer: GPUBuffer;
	texBuffer: GPUBuffer;
	texIndexBuffer: GPUBuffer;
	sectionBuffer: GPUBuffer;
	faceNumber: number = 0;
	bindGroup1: GPUBindGroup;
	constructor(
		minecraftWorld: MinecraftWorld,
		dimension: number,
		x: number,
		y: number,
		z: number,
		palette: PaletteEntry[],
		yzxIndices: Uint16Array) {
		this.minecraftWorld = minecraftWorld;
		this.dimension = dimension;
		this.x = x;
		this.y = y;
		this.z = z;
		this.palette = palette;

		this.blockStates = Array(16).fill(undefined).map(() =>
			Array(16).fill(undefined).map(() =>
				Array(16).fill(undefined)
			)
		);

		this.geomBuffer = gpuDevice.createBuffer({
			label: "section geom buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		this.texBuffer = gpuDevice.createBuffer({
			label: "section tex buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		this.texIndexBuffer = gpuDevice.createBuffer({
			label: "section tex index buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		this.sectionBuffer = gpuDevice.createBuffer({
			label: "section uniform buffer",
			size: 4 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		gpuDevice.queue.writeBuffer(this.sectionBuffer, 0, new Float32Array([this.x * 16, this.y * 16, this.z * 16]));

		this.bindGroup1 = gpuDevice.createBindGroup({
			label: "section bind group 1",
			entries: [{ binding: 0, resource: { buffer: this.sectionBuffer } }],
			layout: minecraftBindgroup1Layout
		});

		let i = 0;
		for (let y = 0; y < 16; y++) {
			for (let z = 0; z < 16; z++) {
				for (let x = 0; x < 16; x++) {
					const paletteIndex = yzxIndices[i++];
					const block = palette[paletteIndex];
					const blockState = this.minecraftWorld.ressourcePack.getBlockStateByURL(block.Name);
					if (!blockState)
						throw new Error(`Blockstate of Block ${block} is unknown.`);
					const blockStateModels = blockState.getVariantByProperties(block.Properties);
					if (!blockStateModels)
						continue
					if (Array.isArray(blockStateModels))
						this.blockStates[z][y][x] = blockStateModels[Math.floor(Math.random() * blockStateModels.length)];
					else
						this.blockStates[z][y][x] = blockStateModels;
				}
			}
		}
	}

	public getBlockStateModel(x: number, y: number, z: number): ParsedBlockStateModel {
		return this.blockStates[z][y][x];
	}

	public buildGeometry() {
		let i = 0;
		const geom: number[] = [];
		const tex: number[] = [];
		const texIndex: number[] = [];

		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 16; y++) {
				for (let x = 0; x < 16; x++) {
					const blockState = this.getBlockStateModel(x, y, z);
					if (!blockState)
						continue
					this.faceNumber += blockState.build(geom, tex, texIndex, x, y, z);
					i++;
				}
			}
		}

		const geomData = new Float32Array(geom);

		this.geomBuffer.destroy();
		this.geomBuffer = gpuDevice.createBuffer({
			label: `section (${this.x}, ${this.y}, ${this.z}) geom buffer`,
			size: geomData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.geomBuffer, 0, geomData);

		const texData = new Float32Array(tex);
		this.texBuffer.destroy();
		this.texBuffer = gpuDevice.createBuffer({
			label: `section (${this.x}, ${this.y}, ${this.z}) tex buffer`,
			size: texData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.texBuffer, 0, texData);

		const texIndexData = new Uint32Array(texIndex);
		this.texIndexBuffer.destroy();
		this.texIndexBuffer = gpuDevice.createBuffer({
			label: `section (${this.x}, ${this.y}, ${this.z}) tex index buffer`,
			size: texIndexData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		gpuDevice.queue.writeBuffer(this.texIndexBuffer, 0, texIndexData);

		this.sectionBuffer.destroy();
		this.sectionBuffer = gpuDevice.createBuffer({
			label: `section (${this.x}, ${this.y}, ${this.z}) uniform buffer`,
			size: 4 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		gpuDevice.queue.writeBuffer(this.sectionBuffer, 0, new Float32Array([this.x * 16, this.y * 16, this.z * 16]));

		this.bindGroup1 = gpuDevice.createBindGroup({
			label: `section (${this.x}, ${this.y}, ${this.z}) bind group 1`,
			entries: [{ binding: 0, resource: { buffer: this.sectionBuffer } }],
			layout: minecraftBindgroup1Layout
		});
	}

	render(renderPassEncoder: GPURenderPassEncoder) {
		if (this.faceNumber === 0)
			return;
		renderPassEncoder.setVertexBuffer(0, this.geomBuffer);
		renderPassEncoder.setVertexBuffer(1, this.texBuffer);
		renderPassEncoder.setVertexBuffer(2, this.texIndexBuffer);
		renderPassEncoder.setBindGroup(1, this.bindGroup1);
		renderPassEncoder.draw(4, this.faceNumber);
	}
}