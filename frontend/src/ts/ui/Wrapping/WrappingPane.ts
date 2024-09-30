import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";
import { IconedToggleButton } from "../components/IconedToggleButton";
import { Project } from "../../project/Project";
import { wasmInstance } from "../../../c/wasmHello";
import { unzip } from "unzipit";
import { ResourcePack } from "../../minecraft/ResourcePack";
import { Section } from "../../minecraft/Section";
import HeightFieldR3 from "../../dynamicObject/heightField/HeightFieldR3";
import { MinecraftOpaquePipeline } from "../../minecraft/MinecraftOpaquePipeline";

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
						res = ResourcePack.parse(await unzip(content), "minecraft", () => {
							console.log("in", performance.now() - n);
							res.initialize();
							MinecraftOpaquePipeline.setRessourcePack(res);

							const tex = res.getTextureByURL("minecraft:block/rail");
							if (!tex)
								return;
							project.scene.heightFieldObjects.forEach((hf: HeightFieldR3) => {
								hf.setAlbedo(tex.gpuTexture);

							})
							console.log(res);
						}, () => { });
						return
					}
					if (file.name.endsWith(".mca")) {
						console.log(".msc")
						try {
							wasmInstance.openRegion("World", 0, 0, 0, content);
							console.log(wasmInstance.buildChunk("World", 0, 0, 0));
							wasmInstance.setActiveChunk("World", 0, 0, 0);
							for (let y = -4; y < 10; y++) {
								const palette = JSON.parse(wasmInstance.getPalette(y));
								const section = new Section(res, 0, 0, y, 0, palette, wasmInstance.getSectionView("World", 0, 0, y, 0));
								project.scene.minecraftSections.add(section);
							}

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