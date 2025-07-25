import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";

import { unzip } from "unzipit";
import { ResourcePack } from "../../minecraft/ResourcePack";
import { MinecraftSection } from "../../minecraft/MinecraftSection";
import { MinecraftWorld, PaletteEntry } from "../../minecraft/MinecraftWorld";
import TextureUtils from "../../Textures/TextureUtils";
import { Kayo } from "../../Kayo";
import RealtimeRenderer from "../../rendering/RealtimeRenderer";
import { CreateAtlasTask } from "../../ressourceManagement/CreateAtlasTask";
import { StoreDataTask } from "../../ressourceManagement/StoreDataTask";

export class WrappingPane extends HTMLElement {
	public baseSplitPaneContainer!: SplitPaneContainer;
	private _header?: HTMLDivElement;
	private _footer!: Footer;
	private _kayo!: Kayo;
	private _handleFile = async (event: Event) => {
		const fi = event.target as HTMLInputElement;
		let res: ResourcePack;
		if (!fi.files) return;
		const project = this._kayo.project;

		for (const file of fi.files) {
			const a = await file.arrayBuffer();

			if (file.type == "image/png") {
				const vts = this._kayo.project.virtualTextureSystem;
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

				const imageData = project.wasmx.imageData.fromImageData(a, true);
				if (imageData === null) continue;

				const task = new StoreDataTask(project.wasmx, "raw", file.name, a, 0, a.byteLength);
				project.wasmx.taskQueue.queueTask(task);

				const atlasTas = new CreateAtlasTask(
					project.wasmx,
					imageData,
					(atlasData: { byteOffset: number; byteLength: number }) => {
						imageData.delete();

						const view = project.wasmx.getMemoryView(atlasData.byteOffset, atlasData.byteLength);
						vt.makeResident(view, 0, 0, 0);
						project.fullRerender();

						const svtWriteFinishedCallback = (writeResult: number) => {
							if (writeResult !== 0) {
								console.error(`SVT Write failed.`);
								return;
							}
							project.wasmx.wasm.deleteArrayUint8(atlasData.byteOffset);
						};
						vt.writeToFileSystem(view, 0, 0, 0, svtWriteFinishedCallback);
					},
				);
				project.wasmx.taskQueue.queueTask(atlasTas);
				continue;
			}

			if (file.type == "audio/mpeg") {
				const audio = project.kayo.audioContext;
				const bufferSource = project.kayo.audioContext.createBufferSource();
				bufferSource.connect(audio.destination);
				bufferSource.buffer = await audio.decodeAudioData(a);
				bufferSource.start();
			}

			// Create a FileReader to read the file as an ArrayBuffer
			const reader = new FileReader();
			reader.onload = async function (e) {
				const content = e.target?.result;
				if (!content) return;
				if (file.type === "application/x-zip-compressed") {
					const n = performance.now();

					const image = await TextureUtils.loadImageBitmap("./glowstone.png");
					const vt = project.virtualTextureSystem.allocateVirtualTexture(
						"test texture",
						image.width,
						image.height,
						"repeat",
						"repeat",
						"linear",
						"linear",
						"linear",
						true,
					);
					if (vt === undefined) return;
					// const atlas = project.virtualTextureSystem.generateMipAtlas(image, vt.samplingDescriptor);
					// vt.makeResident(atlas, 0, 0, 0);

					const zipInfo = await unzip(content);
					res = ResourcePack.parse(
						zipInfo,
						file.name.substring(0, file.name.lastIndexOf(".")),
						res,
						vt,
						() => {
							res.initialize(vt.virtualTextureSystem);
							console.log("in", performance.now() - n, res);
						},
						() => {},
					);
					return;
				}
				if (file.name.endsWith(".mca")) {
					console.log(".msc");
					try {
						const world = project.kayo.wasmx.minecraftModule.createWorldData("My World");
						const dimension = world.createDimensionData("Overworld", 0);
						dimension.openRegion(0, 0, content);
						const mWorld = new MinecraftWorld("World", res, 8);
						project.scene.minecraftWorld = mWorld;
						for (let x = 0; x < 8; x++) {
							for (let z = 0; z < 8; z++) {
								const status = dimension.buildChunk(x, z);
								if (status !== 0) continue;

								for (let y = -4; y < 15; y++) {
									const palette = JSON.parse(dimension.getPalette(x, y, z)) as PaletteEntry[];
									let sectionDataView: any = undefined;
									if (palette.length > 1) sectionDataView = dimension.getSectionView(x, y, z);
									else if (palette.length === 1 && palette[0].Name == "minecraft:air") continue;
									const section = new MinecraftSection(
										project,
										mWorld,
										0,
										x,
										y,
										z,
										palette,
										sectionDataView,
									);
									project.scene.minecraftWorld.setSection(x, y, z, section);
								}
							}
						}
						mWorld.buildGeometry();
						mWorld.buildBundle(
							project.gpux.gpuDevice,
							project.renderers[RealtimeRenderer.rendererKey].bindGroup0,
						);
					} catch (e) {
						console.error(e);
					}
				}
			};

			// reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
		}

		this._kayo.project.virtualTextureSystem.physicalTexture.generateAllMips();
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
			openButton.addEventListener("click", () => fi.click());
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
