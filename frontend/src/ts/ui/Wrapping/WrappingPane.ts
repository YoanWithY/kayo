import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";
import { IconedToggleButton } from "../components/IconedToggleButton";
import { Project } from "../../project/Project";
import { unzip } from "unzipit";
import { ResourcePack } from "../../minecraft/ResourcePack";
import { MinecraftSection } from "../../minecraft/MinecraftSection";
import { MinecraftWorld, PaletteEntry } from "../../minecraft/MinecraftWorld";
import TextureUtils from "../../Textures/TextureUtils";
import { Kayo } from "../../Kayo";

export class WrappingPane extends HTMLElement {
	project!: Project;
	baseSplitPaneContainer!: SplitPaneContainer;
	header!: HTMLDivElement;
	footer!: Footer;
	static createWrappingPane(win: Window, kayo: Kayo, defaultPane: string): WrappingPane {
		const p = win.document.createElement("wrapping-pane") as WrappingPane;
		const project = kayo.project;
		p.project = project;
		p.baseSplitPaneContainer = SplitPaneContainer.createRoot(win, kayo, p, defaultPane);
		p.header = win.document.createElement("div");

		const fullScreenButton = IconedToggleButton.createIconedToggleButton(
			win,
			fullScreenOffIcon,
			fullScreenOnIcon,
			() => {
				if (win.document.fullscreenElement) win.document.exitFullscreen();
			},
			() => win.document.documentElement.requestFullscreen(),
		);

		win.addEventListener("fullscreenchange", () => {
			if (!win.document.fullscreenElement) {
				fullScreenButton.turnOff();
			}
		});

		p.header.appendChild(fullScreenButton);

		const fi = win.document.createElement("input");
		fi.type = "file";
		let res: ResourcePack;
		fi.addEventListener("change", async () => {
			const file = fi.files?.[0];
			if (file) {
				// Create a FileReader to read the file as an ArrayBuffer
				const reader = new FileReader();
				reader.onload = async function (e) {
					const content = e.target?.result;
					if (!content) return;
					if (file.type === "application/x-zip-compressed") {
						const n = performance.now();

						const image = await TextureUtils.loadImageBitmap("./glowstone.png");
						const vt = project.renderer.virtualTextureSystem.allocateVirtualTexture(
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
						const atlas = project.renderer.virtualTextureSystem.generateMipAtlas(
							image,
							vt.samplingDescriptor,
						);
						vt.makeResident(atlas, 0, 0, 0);

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
										let section: MinecraftSection;
										let sectionDataView: any = undefined;
										if (palette.length > 1) sectionDataView = dimension.getSectionView(x, y, z);
										else if (palette.length === 1 && palette[0].Name == "minecraft:air") continue;
										section = new MinecraftSection(
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
							mWorld.buildBundle(project.gpux.gpuDevice, project.renderer.bindGroup0);
						} catch (e) {
							console.error(e);
						}
					}
				};
				reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
			}
		});
		p.header.appendChild(fi);

		p.footer = Footer.createFooter();
		p.appendChild(p.header);
		p.appendChild(p.baseSplitPaneContainer);
		p.appendChild(p.footer);
		return p;
	}
}
