import { Project } from "../project/Project";
import { MinecraftBlock } from "./MinecraftBlock";
import { MinecraftOpaquePipeline } from "./MinecraftOpaquePipeline";
import { MinecraftWorld, PaletteEntry } from "./MinecraftWorld";
export class MinecraftSection {
	private _minecraftWorld: MinecraftWorld;
	private _dimension: number;
	private _x: number;
	private _y: number;
	private _z: number;
	private _blocks!: MinecraftBlock[][][];
	private _geomBuffer: GPUBuffer;
	private _texBuffer: GPUBuffer;
	private _texIndexBuffer: GPUBuffer;
	private _sectionBuffer: GPUBuffer;
	private _faceNumber: number = 0;
	private _bindGroup1: GPUBindGroup;
	private gpuDevice;
	constructor(
		project: Project,
		minecraftWorld: MinecraftWorld,
		dimension: number,
		x: number,
		y: number,
		z: number,
		palette: PaletteEntry[],
		yzxIndices: Uint16Array,
	) {
		this._minecraftWorld = minecraftWorld;
		this._dimension = dimension;
		this._x = x;
		this._y = y;
		this._z = z;
		this.gpuDevice = project.gpux.gpuDevice;
		this._geomBuffer = this.gpuDevice.createBuffer({
			label: "section geom buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this._texBuffer = this.gpuDevice.createBuffer({
			label: "section tex buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this._texIndexBuffer = this.gpuDevice.createBuffer({
			label: "section tex index buffer",
			size: 0,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this._sectionBuffer = this.gpuDevice.createBuffer({
			label: "section uniform buffer",
			size: 4 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.gpuDevice.queue.writeBuffer(
			this._sectionBuffer,
			0,
			new Float32Array([this._x * 16, this._y * 16, this._z * 16]),
		);

		this._bindGroup1 = this.gpuDevice.createBindGroup({
			label: "section bind group 1",
			entries: [{ binding: 0, resource: { buffer: this._sectionBuffer } }],
			layout: MinecraftOpaquePipeline.minecraftBindgroup1Layout,
		});

		let i = 0;
		if (palette.length === 1 && palette[0].Name == "minecraft:air") {
			this.getBlock = () => undefined;
		}

		this._blocks = Array(16)
			.fill(undefined)
			.map(() =>
				Array(16)
					.fill(undefined)
					.map(() => Array(16).fill(undefined)),
			);

		if (palette.length === 1) {
			const paletteEntry = palette[0];
			const blockState = this._minecraftWorld.ressourcePack.getBlockStateByURL(paletteEntry.Name);
			if (!blockState) throw new Error(`Blockstate of Block ${paletteEntry} is unknown.`);
			const blockStateModels = blockState.getBlockStateModelByProperties(paletteEntry.Properties);

			if (!blockStateModels) return;
			for (let y = 0; y < 16; y++) {
				for (let z = 0; z < 16; z++) {
					for (let x = 0; x < 16; x++) {
						this._blocks[z][y][x] = new MinecraftBlock(paletteEntry.Name, blockStateModels);
					}
				}
			}
		} else {
			for (let y = 0; y < 16; y++) {
				for (let z = 0; z < 16; z++) {
					for (let x = 0; x < 16; x++) {
						const paletteIndex = yzxIndices[i++];
						const paletteEntry = palette[paletteIndex];
						const blockState = this._minecraftWorld.ressourcePack.getBlockStateByURL(paletteEntry.Name);
						if (!blockState) throw new Error(`Blockstate of Block ${paletteEntry} is unknown.`);
						const blockStateModels = blockState.getBlockStateModelByProperties(paletteEntry.Properties);

						if (!blockStateModels) continue;

						this._blocks[z][y][x] = new MinecraftBlock(paletteEntry.Name, blockStateModels);
					}
				}
			}
		}
	}

	public getBlock(x: number, y: number, z: number): MinecraftBlock | undefined {
		return this._blocks[z][y][x];
	}

	public buildGeometry() {
		let i = 0;
		const geom: number[] = [];
		const tex: number[] = [];
		const texIndex: number[] = [];

		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 16; y++) {
				for (let x = 0; x < 16; x++) {
					const block = this.getBlock(x, y, z);
					if (!block) continue;

					const n = this._minecraftWorld.getNeighborhoodOf(this._x, this._y, this._z, x, y, z);
					this._faceNumber += block.build(geom, tex, texIndex, x, y, z, n);
					i++;
				}
			}
		}

		const geomData = new Float32Array(geom);

		this._geomBuffer.destroy();
		this._geomBuffer = this.gpuDevice.createBuffer({
			label: `section (${this._x}, ${this._y}, ${this._z}) geom buffer`,
			size: geomData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		this.gpuDevice.queue.writeBuffer(this._geomBuffer, 0, geomData);

		const texData = new Float32Array(tex);
		this._texBuffer.destroy();
		this._texBuffer = this.gpuDevice.createBuffer({
			label: `section (${this._x}, ${this._y}, ${this._z}) tex buffer`,
			size: texData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		this.gpuDevice.queue.writeBuffer(this._texBuffer, 0, texData);

		const texIndexData = new Uint32Array(texIndex);
		this._texIndexBuffer.destroy();
		this._texIndexBuffer = this.gpuDevice.createBuffer({
			label: `section (${this._x}, ${this._y}, ${this._z}) tex index buffer`,
			size: texIndexData.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		this.gpuDevice.queue.writeBuffer(this._texIndexBuffer, 0, texIndexData);

		this._sectionBuffer.destroy();
		this._sectionBuffer = this.gpuDevice.createBuffer({
			label: `section (${this._x}, ${this._y}, ${this._z}) uniform buffer`,
			size: 4 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.gpuDevice.queue.writeBuffer(
			this._sectionBuffer,
			0,
			new Float32Array([this._x * 16, this._y * 16, this._z * 16]),
		);

		this._bindGroup1 = this.gpuDevice.createBindGroup({
			label: `section (${this._x}, ${this._y}, ${this._z}) bind group 1`,
			entries: [{ binding: 0, resource: { buffer: this._sectionBuffer } }],
			layout: MinecraftOpaquePipeline.minecraftBindgroup1Layout,
		});
	}

	public render(renderPassEncoder: GPURenderPassEncoder | GPURenderBundleEncoder) {
		if (this._faceNumber === 0) return 0;
		renderPassEncoder.setVertexBuffer(0, this._geomBuffer);
		renderPassEncoder.setVertexBuffer(1, this._texBuffer);
		renderPassEncoder.setVertexBuffer(2, this._texIndexBuffer);
		renderPassEncoder.setBindGroup(1, this._bindGroup1);
		renderPassEncoder.draw(4, this._faceNumber);
		return this._faceNumber;
	}

	public get minecraftWorld(): MinecraftWorld {
		return this._minecraftWorld;
	}

	public get dimension(): number {
		return this._dimension;
	}

	public get x(): number {
		return this._x;
	}

	public get y(): number {
		return this._y;
	}

	public get z(): number {
		return this._z;
	}
}
