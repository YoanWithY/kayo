import { ViewportPane } from "./panes/ViewportPane";
import OutlinerPane, { OutlinerElement } from "./panes/OutlinerPane";
import RessourcePane from "./panes/RessourcePane";
import PaneSelectorPane from "./panes/PaneSelectorPane";
import OutputPane from "./panes/OutputPane";
import { SplitPaneContainer } from "./splitpane/SplitPaneContainer";
import { SplitButtonLL, SplitButtonLR, SplitButtonUL, SplitButtonUR } from "./splitpane/SplitButton";
import { SplitPaneDivider, SplitPaneGrabber } from "./splitpane/SplitPaneDivider";
import { SplitablePane } from "./splitpane/SplitablePane";
import { PaneStripe } from "./panes/PaneStripe";
import Collapsible, { CollapsibleButton, CollapsibleContentContainer } from "./components/Collapsible";
import Tooltip from "./components/Tooltip";
import Grid2Col from "./components/Grid2Col";
import Checkbox from "./components/Checkbox";
import { SelectBox, SelectOption, SelectOptionWrapper } from "./components/Select";

export function initUI() {
	window.customElements.define("tool-tip", Tooltip);
	window.customElements.define("grid-2col", Grid2Col);
	window.customElements.define("pane-stripe", PaneStripe);
	window.customElements.define("check-box", Checkbox);
	window.customElements.define("select-box", SelectBox);
	window.customElements.define("select-option-wrapper", SelectOptionWrapper);
	window.customElements.define("select-option", SelectOption);

	window.customElements.define("viewport-pane", ViewportPane);
	window.customElements.define("ressource-pane", RessourcePane);
	window.customElements.define("pane-selector-pane", PaneSelectorPane);
	window.customElements.define("outliner-pane", OutlinerPane);
	window.customElements.define("output-pane", OutputPane);

	window.customElements.define("outliner-element", OutlinerElement)
	window.customElements.define("split-button-ul", SplitButtonUL);
	window.customElements.define("split-button-ur", SplitButtonUR);
	window.customElements.define("split-button-ll", SplitButtonLL);
	window.customElements.define("split-button-lr", SplitButtonLR);
	window.customElements.define("split-pane-divider", SplitPaneDivider);
	window.customElements.define("split-pane-grabber", SplitPaneGrabber);
	window.customElements.define("split-pane-container", SplitPaneContainer);
	window.customElements.define("splitable-pane", SplitablePane);

	window.customElements.define("collapsible-element", Collapsible);
	window.customElements.define("collapsible-button", CollapsibleButton);
	window.customElements.define("collapsible-content-container", CollapsibleContentContainer);
}