import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";
import { unzip } from "unzipit";
import { ResourcePack } from "../../minecraft/ResourcePack";
import { MinecraftSection } from "../../minecraft/MinecraftSection";
import { MinecraftWorld, PaletteEntry } from "../../minecraft/MinecraftWorld";
import { Kayo } from "../../Kayo";
import { StoreFileTask } from "../../ressourceManagement/jsTasks/StoreFileTask";
import { CreateAtlasTask } from "../../ressourceManagement/wasmTasks/CreateAtlasTask";
import { ParseObjTask } from "../../ressourceManagement/wasmTasks/ParseObjTask";
import { VectorMesh } from "../../../c/KayoCorePP";
import { MeshObject } from "../../mesh/MeshObject";
import { Material } from "../../mesh/Material";

let ressourecePack!: ResourcePack;

export class WrappingPane extends HTMLElement {
	public baseSplitPaneContainer!: SplitPaneContainer;
	private _header?: HTMLDivElement;
	private _footer!: Footer;
	private _kayo!: Kayo;
	private _handleFile = async (event: Event) => {
		const fi = event.target as HTMLInputElement;
		if (!fi.files) return;
		const project = this._kayo.project;

		for (const file of fi.files) {
			// eslint-disable-next-line local/no-await
			const fileData = await file.arrayBuffer();
			if (file.type == "") {
				if (file.name.toLowerCase().endsWith(".obj")) {
					const meshCallback = (val: { meshes: VectorMesh }) => {
						for (let i = 0; i < val.meshes.size(); i++) {
							const mesh = val.meshes.get(i);
							if (!mesh) continue;
							for (let i = 0; i < mesh.materials.size(); i++) {
								const matName = mesh.materials.get(i);
								if (!matName) continue;
								this._kayo.project.scene.addMaterial(new Material(matName as string));
							}

							this._kayo.project.scene.addMeshObject(new MeshObject(mesh));
						}
						this._kayo.project.fullRerender();
					};
					const task = new ParseObjTask(this._kayo.wasmx, fileData, meshCallback);
					this._kayo.taskQueue.queueWasmTask(task);
				}
			}

			if (file.type == "image/png") {
				const vts = this._kayo.virtualTextureSystem;
				const vt = vts.allocateVirtualTexture(
					file.name,
					16,
					16,
					"repeat",
					"repeat",
					"linear",
					"nearest",
					"linear",
					false,
				);
				if (!vt) return;

				const imageData = this._kayo.wasmx.imageData.fromImageData(fileData, true);
				if (imageData === null) continue;

				const storeFileTask = new StoreFileTask("./raw", file.name, new Uint8Array(fileData));
				this._kayo.taskQueue.queueFSTask(storeFileTask);

				const atlasFinishedCallback = (atlasData: { byteOffset: number; byteLength: number }) => {
					imageData.delete();

					const view = this._kayo.wasmx.getUint8View(atlasData.byteOffset, atlasData.byteLength);
					vt.makeResident(view, 0, 0, 0);
					project.fullRerender();

					const svtWriteFinishedCallback = (writeResult: number) => {
						if (writeResult !== 0) {
							console.error(`SVT Write failed.`);
							return;
						}
						this._kayo.wasmx.wasm.deleteArrayUint8(atlasData.byteOffset);
					};
					vt.writeToFileSystem(view, 0, 0, 0, svtWriteFinishedCallback);
				};
				const atlasTas = new CreateAtlasTask(this._kayo.wasmx, imageData, atlasFinishedCallback);
				this._kayo.taskQueue.queueWasmTask(atlasTas);
				continue;
			}

			if (file.type == "audio/mpeg") {
				const audio = this._kayo.audioContext;
				const bufferSource = this._kayo.audioContext.createBufferSource();
				bufferSource.connect(audio.destination);
				// eslint-disable-next-line local/no-await
				bufferSource.buffer = await audio.decodeAudioData(fileData);
				bufferSource.start();
			}

			if (file.type === "application/x-zip-compressed") {
				const n = performance.now();

				// eslint-disable-next-line local/no-await
				const zipInfo = await unzip(fileData);

				const onDone = () => {
					ressourecePack.initialize(this._kayo.virtualTextureSystem);
					console.log("in", performance.now() - n, ressourecePack);
				};
				const onProgress = () => {};
				ressourecePack = ResourcePack.parse(
					this._kayo,
					zipInfo,
					file.name.substring(0, file.name.lastIndexOf(".")),
					undefined,
					onDone,
					onProgress,
				);
				return;
			}
			if (file.name.endsWith(".mca")) {
				console.log(".msc");
				try {
					// const world = new this._kayo.wasmx.wasm.KayoWASMMinecraftWorld("My World");
					const dimension = new this._kayo.wasmx.wasm.KayoWASMMinecraftDimension("Overworld", 0);
					dimension.openRegion(0, 0, fileData);
					const mWorld = new MinecraftWorld(project, "World", ressourecePack, 16);
					for (let x = 0; x < 4; x++) {
						for (let z = 0; z < 4; z++) {
							const status = dimension.buildChunk(x, z);
							if (status !== 0) continue;

							for (let y = -4; y < 15; y++) {
								const palette = JSON.parse(dimension.getPalette(x, y, z)) as PaletteEntry[];
								let sectionDataView: any = undefined;
								if (palette.length > 1) sectionDataView = dimension.getSectionView(x, y, z);
								else if (palette.length === 1 && palette[0].Name == "minecraft:air") continue;
								const section = new MinecraftSection(
									this._kayo,
									mWorld,
									0,
									x,
									y,
									z,
									palette,
									sectionDataView,
								);
								mWorld.setSection(x, y, z, section);
							}
						}
					}
					mWorld.buildGeometry();
					project.scene.addMinecraftWorld(mWorld);
				} catch (e) {
					console.error(e);
				}
			}
		}

		this._kayo.virtualTextureSystem.physicalTexture.generateAllMips();
	};

	public static createWrappingPane(win: Window, kayo: Kayo, defaultPane: string, useHeader: boolean): WrappingPane {
		const p = win.document.createElement("wrapping-pane") as WrappingPane;
		p._kayo = kayo;
		p.baseSplitPaneContainer = SplitPaneContainer.createRoot(win, kayo, p, defaultPane);

		if (useHeader) {
			p._header = win.document.createElement("div");
			const fi = win.document.createElement("input");
			fi.multiple = true;
			fi.type = "file";
			fi.addEventListener("change", p._handleFile);

			const openButton = win.document.createElement("button");
			const fileClickCallback = () => fi.click();
			openButton.addEventListener("click", fileClickCallback);
			openButton.textContent = "File";

			p._header.appendChild(openButton);
			p.appendChild(p._header);
		}

		p.appendChild(p.baseSplitPaneContainer);

		p._footer = Footer.createFooter(win);
		p.appendChild(p._footer);
		return p;
	}
}
