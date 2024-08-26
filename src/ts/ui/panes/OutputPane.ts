
export default class OutputPane extends HTMLElement {
	public static createOutputPane(): OutputPane {
		const p = document.createElement("output-pane") as OutputPane;

		return p;
	}
}