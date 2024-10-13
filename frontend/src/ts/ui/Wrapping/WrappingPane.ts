import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";
import { IconedToggleButton } from "../components/IconedToggleButton";
import { Project } from "../../project/Project";
import { wasmInstance } from "../../../c/wasmHello";
import { unzip } from "unzipit";
import { ResourcePack } from "../../minecraft/ResourcePack";
import { MinecraftSection } from "../../minecraft/MinecraftSection";
import { MinecraftOpaquePipeline } from "../../minecraft/MinecraftOpaquePipeline";
import { MinecraftWorld, PaletteEntry } from "../../minecraft/MinecraftWorld";

export class WrappingPane extends HTMLElement {
	project!: Project;
	baseSplitPaneContainer!: SplitPaneContainer;
	header!: HTMLDivElement;
	footer!: Footer;
	static createWrappingPane(project: Project): WrappingPane {
		const p = document.createElement("wrapping-pane") as WrappingPane;
		p.project = project;
		p.baseSplitPaneContainer = SplitPaneContainer.createRoot(project);
		p.header = document.createElement("div");

		const fullScreenButton = IconedToggleButton.createIconedToggleButton(
			fullScreenOffIcon,
			fullScreenOnIcon,
			() => {
				if (document.fullscreenElement)
					document.exitFullscreen();
			},
			() => document.documentElement.requestFullscreen()
		);

		document.addEventListener('fullscreenchange', () => {
			if (!document.fullscreenElement) {
				fullScreenButton.turnOff();
			}
		});

		p.header.appendChild(fullScreenButton);

		const fi = document.createElement("input");
		fi.type = "file";
		let res: ResourcePack;
		fi.addEventListener("change", async () => {
			const file = fi.files?.[0];
			if (file) {
				// Create a FileReader to read the file as an ArrayBuffer
				const reader = new FileReader();
				reader.onload = async function (e) {
					const content = e.target?.result;
					if (!content)
						return

					if (file.type === "application/x-zip-compressed") {
						const n = performance.now();

						res = ResourcePack.parse(await unzip(content), file.name.substring(0, file.name.lastIndexOf(".")), res, () => {
							res.initialize();
							MinecraftOpaquePipeline.setRessourcePack(res);

							console.log("in", performance.now() - n, res);
						}, () => { });
						return
					}
					if (file.name.endsWith(".mca")) {
						console.log(".msc")
						try {
							wasmInstance.openRegion("World", 0, 0, 0, content);
							const mWorld = new MinecraftWorld("World", res);
							project.scene.minecraftWorld = mWorld;
							for (let x = 0; x < 8; x++) {
								for (let z = 0; z < 8; z++) {

									const status = wasmInstance.buildChunk("World", 0, x, z);
									if (status !== 0)
										continue;

									wasmInstance.setActiveChunk("World", 0, x, z);
									for (let y = -4; y < 15; y++) {
										const palette = JSON.parse(wasmInstance.getPalette(y)) as PaletteEntry[];
										let section: MinecraftSection;
										let sectionDataView: any = undefined;
										if (palette.length > 1)
											sectionDataView = wasmInstance.getSectionView("World", 0, x, y, z);
										else if (palette.length === 1 && palette[0].Name == "minecraft:air")
											continue
										section = new MinecraftSection(mWorld, 0, x, y, z, palette, sectionDataView);
										project.scene.minecraftWorld.setSection(x, y, z, section);
									}
								}
							}
							mWorld.buildGeometry();
							mWorld.buildBundle(project.renderer.bindGroup0);

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