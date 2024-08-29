import { openProject } from "../../project/Project";
import Checkbox from "../components/Checkbox";
import Collapsible from "../components/Collapsible";
import Grid2Col from "../components/Grid2Col";
import { createSpan } from "../UIUtils";

function buildOption(value: string, text: string): HTMLOptionElement {
	const option = document.createElement("option");
	option.value = value;
	option.textContent = text;
	return option;
}

export default class OutputPane extends HTMLElement {

	public static createOutputPane(): OutputPane {
		const p = document.createElement("output-pane") as OutputPane;;


		const renderingCollapsible = Collapsible.createCollapsible("Rendering");
		const renderMode = document.createElement("select");
		renderMode.appendChild(buildOption("forward", "Forward"));
		renderMode.appendChild(buildOption("deferred", "Deferred"));

		let grid2col = Grid2Col.createGrid2Col();
		grid2col.appendChild(createSpan("Render Mode"));
		grid2col.appendChild(renderMode);

		renderingCollapsible.collapsibleContentContainer.appendChild(grid2col);
		p.appendChild(renderingCollapsible);


		const displayOuputCollapsible = Collapsible.createCollapsible("Display Output");


		const colorSpaceSelect = document.createElement("select");
		colorSpaceSelect.appendChild(buildOption("srgb", "sRGB"));
		colorSpaceSelect.appendChild(buildOption("display-p3", "Display-P3"));

		grid2col = Grid2Col.createGrid2Col();
		grid2col.appendChild(createSpan("Color Space"));
		grid2col.appendChild(colorSpaceSelect);
		grid2col.appendChild(createSpan("HDR"));

		const checkbox = Checkbox.createCheckbox();
		checkbox.setTooltip('Sets the presentation format to a 16 bpc floating point format.\nSet the presentation tonemapping to extended.\nHDR output may not work with every colorspace.\nThis will decrese performance.');
		// checkbox.bind(openProject.useHDR);
		grid2col.appendChild(checkbox)

		displayOuputCollapsible.collapsibleContentContainer.appendChild(grid2col);

		p.appendChild(displayOuputCollapsible);
		return p;
	}
}