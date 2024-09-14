import { MSAAOptions, SwapChainBitDepth } from "../../project/Config";
import { Project } from "../../project/Project";
import { OutputForwardRenderState } from "../../project/State";
import Collapsible from "../components/Collapsible";
import Grid2Col from "../components/Grid2Col";
import { SelectBox } from "../components/Select";
import { createSpan } from "../UIUtils";
export default class OutputPane extends HTMLElement {

	public static createOutputPane(project: Project): OutputPane {
		const p = document.createElement("output-pane") as OutputPane;;

		const renderingCollapsible = Collapsible.createCollapsible("Rendering");

		const msaaSelect = SelectBox.createSelectBox<MSAAOptions>();
		msaaSelect.addOption(1, "1");
		msaaSelect.addOption(4, "4");
		msaaSelect.bind((project.state.output.render as OutputForwardRenderState).msaa)
		let grid2col = Grid2Col.createGrid2Col();
		grid2col.appendChild(createSpan("MSAA"));
		grid2col.appendChild(msaaSelect);

		renderingCollapsible.collapsibleContentContainer.appendChild(grid2col);
		p.appendChild(renderingCollapsible);

		const displayOuputCollapsible = Collapsible.createCollapsible("Display Output");

		const colorSpaceSelect = SelectBox.createSelectBox<PredefinedColorSpace>();
		colorSpaceSelect.addOption("display-p3", "Display-P3");
		colorSpaceSelect.addOption("srgb", "sRGB");
		colorSpaceSelect.bind(project.state.output.display.swapChainColorSpace);

		const colorBitDepthSelect = SelectBox.createSelectBox<SwapChainBitDepth>();
		colorBitDepthSelect.addOption("8bpc", "8 bpc");
		colorBitDepthSelect.addOption("16bpc", "16 bpc");
		colorBitDepthSelect.bind(project.state.output.display.swapChainBitDepth);


		const dynamicRangeSelec = SelectBox.createSelectBox<GPUCanvasToneMappingMode>();
		dynamicRangeSelec.addOption("standard", "Standard");
		dynamicRangeSelec.addOption("extended", "Extended");
		dynamicRangeSelec.bind(project.state.output.display.swapChainToneMappingMode);


		grid2col = Grid2Col.createGrid2Col();
		grid2col.appendChild(createSpan("Color Space"));
		grid2col.appendChild(colorSpaceSelect);
		grid2col.appendChild(createSpan("Bit Depth"));
		grid2col.appendChild(colorBitDepthSelect);
		grid2col.appendChild(createSpan("Dynamic Range"));
		grid2col.appendChild(dynamicRangeSelec);

		displayOuputCollapsible.collapsibleContentContainer.appendChild(grid2col);

		p.appendChild(displayOuputCollapsible);
		return p;
	}
}