import { ViewportPane } from "./panes/ViewportPane";
import OutlinerPane, { OutlinerElement } from "./panes/OutlinerPane";
import RessourcePane from "./panes/RessourcePane";
import PaneSelectorPane from "./panes/PaneSelectorPane";
import { SplitPaneContainer } from "./splitpane/SplitPaneContainer";
import { SplitButtonLL, SplitButtonLR, SplitButtonUL, SplitButtonUR } from "./splitpane/SplitButton";
import { SplitPaneDivider, SplitPaneGrabber } from "./splitpane/SplitPaneDivider";
import { SplitablePane } from "./splitpane/SplitablePane";
import { PaneStripe } from "./panes/PaneStripe";
import Collapsible, { CollapsibleButton, CollapsibleContentContainer } from "./components/Collapsible";
import Tooltip from "./components/Tooltip";
import Grid2Col from "./components/Grid2Col";
import Checkbox from "./components/Checkbox";
import { StateSelectBox, SelectOption, SelectOptionWrapper, SelectBox } from "./components/StateSelectBox";
import { WrappingPane } from "./Wrapping/WrappingPane";
import { Footer } from "./Wrapping/Footer";
import { FullStretch } from "./components/FullStretch";
import { IconedToggleButton } from "./components/IconedToggleButton";
import { Kayo } from "../Kayo";
import OutputPane from "./panes/OutpuPane";
import SpanElement from "./components/SpanElement";
import { PTPChatContent, PTPChatPane, PTPMessageElement, PTPTextInput } from "../collaborative/PTPChatPannel";
import VBox from "./components/VBox";
import { NumberInput } from "./components/NumberInput";
import { Collapsible2 } from "./components/Collapsible2";

export function initUI() {
	window.customElements.define("tool-tip", Tooltip);
	window.customElements.define(Grid2Col.getDomClass(), Grid2Col);
	window.customElements.define(NumberInput.getDomClass(), NumberInput);
	window.customElements.define(PaneStripe.getDomClass(), PaneStripe);
	window.customElements.define(Checkbox.getDomClass(), Checkbox);
	window.customElements.define(StateSelectBox.getDomClass(), StateSelectBox);
	window.customElements.define(SelectBox.getDomClass(), SelectBox);
	window.customElements.define(PTPTextInput.getDomClass(), PTPTextInput, { extends: "form" });
	window.customElements.define(PTPChatContent.getDomClass(), PTPChatContent);
	window.customElements.define(PTPMessageElement.getDomClass(), PTPMessageElement);
	window.customElements.define(Collapsible2.getDomClass(), Collapsible2);
	window.customElements.define("select-option-wrapper", SelectOptionWrapper);
	window.customElements.define("select-option", SelectOption);
	window.customElements.define("iconed-toggle-button", IconedToggleButton);

	window.customElements.define(ViewportPane.getDomClass(), ViewportPane);
	window.customElements.define(RessourcePane.getDomClass(), RessourcePane);
	window.customElements.define(OutputPane.getDomClass(), OutputPane);
	window.customElements.define(PaneSelectorPane.getDomClass(), PaneSelectorPane);
	window.customElements.define(OutlinerPane.getDomClass(), OutlinerPane);
	window.customElements.define(PTPChatPane.getDomClass(), PTPChatPane);

	window.customElements.define("wrapping-pane", WrappingPane);
	window.customElements.define("full-strech", FullStretch);
	window.customElements.define("footer-element", Footer);

	window.customElements.define("outliner-element", OutlinerElement);
	window.customElements.define("split-button-ul", SplitButtonUL);
	window.customElements.define("split-button-ur", SplitButtonUR);
	window.customElements.define("split-button-ll", SplitButtonLL);
	window.customElements.define("split-button-lr", SplitButtonLR);
	window.customElements.define("split-pane-divider", SplitPaneDivider);
	window.customElements.define("split-pane-grabber", SplitPaneGrabber);
	window.customElements.define("split-pane-container", SplitPaneContainer);
	window.customElements.define("splitable-pane", SplitablePane);

	window.customElements.define(Collapsible.getDomClass(), Collapsible);
	window.customElements.define(CollapsibleButton.getDomClass(), CollapsibleButton);
	window.customElements.define(CollapsibleContentContainer.getDomClass(), CollapsibleContentContainer);
}

const nameClassMap: { [key: string]: UIElement } = {
	[OutputPane.getDomClass()]: OutputPane,
	[Collapsible.getDomClass()]: Collapsible,
	[Grid2Col.getDomClass()]: Grid2Col,
	[SpanElement.getDomClass()]: SpanElement,
	[StateSelectBox.getDomClass()]: StateSelectBox,
	[PTPChatContent.getDomClass()]: PTPChatContent,
	[PTPTextInput.getDomClass()]: PTPTextInput,
	[VBox.getDomClass()]: VBox,
	[Checkbox.getDomClass()]: Checkbox,
	[NumberInput.getDomClass()]: NumberInput,
	[Collapsible2.getDomClass()]: Collapsible2,
};

export function buildUIElement(win: Window, kayo: Kayo, obj: any, variables: any): HTMLElement {
	return nameClassMap[obj.class].createUIElement(win, kayo, obj, variables);
}

export interface UIElement {
	new (): any;
	createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): HTMLElement;
	getDomClass(): string;
}

export interface UIPaneElement extends UIElement {
	getName(): string;
}
