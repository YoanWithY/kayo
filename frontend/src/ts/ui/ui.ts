import { ViewportPane } from "./panes/ViewportPane";
import OutlinerPane, { OutlinerElement } from "./panes/OutlinerPane";
import APIPanel from "./panes/debug/ApiPanel";
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
import { DropDown, DropDownItem } from "./components/DropDown";
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
import { FileSystemPanel } from "./panes/debug/FileSystemPanel";
import { SplashScreen } from "./panes/SplashScreen";
import { AnimationPane } from "./panes/animation/AnimationPane";
import { RadioButton, RadioButtonWrapper } from "./components/RadioButton";
import { TabbedPanel } from "./components/TabbedPanel";
import { PerformancePanel } from "./panes/debug/performance/PerformancePanel";
import { DebugPane } from "./panes/debug/DebugPane";
import { SVTDebugPanel } from "./panes/debug/svtDebug/SVTDebugPanel";
import { SelectBox } from "./components/SelectBox";

export type MarkUneffectiveEntry = { stateVariableURL: string; anyOf: any[] };

export function initUI() {
	const contextMenuCallback = (e: MouseEvent) => {
		e.preventDefault();
	};
	window.document.addEventListener("contextmenu", contextMenuCallback);
	window.customElements.define("tool-tip", Tooltip);
	window.customElements.define(Grid2Col.getDomClass(), Grid2Col);
	window.customElements.define(NumberInput.getDomClass(), NumberInput);
	window.customElements.define(PaneStripe.getDomClass(), PaneStripe);
	window.customElements.define(Checkbox.getDomClass(), Checkbox);
	window.customElements.define(RadioButtonWrapper.getDomClass(), RadioButtonWrapper);
	window.customElements.define(RadioButton.getDomClass(), RadioButton);
	window.customElements.define(SelectBox.getDomClass(), SelectBox);
	window.customElements.define(PTPTextInput.getDomClass(), PTPTextInput, { extends: "form" });
	window.customElements.define(PTPChatContent.getDomClass(), PTPChatContent);
	window.customElements.define(PTPMessageElement.getDomClass(), PTPMessageElement);
	window.customElements.define(TabbedPanel.getDomClass(), TabbedPanel);
	window.customElements.define(DropDown.getDomClass(), DropDown);
	window.customElements.define(DropDownItem.getDomClass(), DropDownItem);
	window.customElements.define("iconed-toggle-button", IconedToggleButton);

	window.customElements.define(ViewportPane.getDomClass(), ViewportPane);
	window.customElements.define(OutputPane.getDomClass(), OutputPane);
	window.customElements.define(PaneSelectorPane.getDomClass(), PaneSelectorPane);
	window.customElements.define(OutlinerPane.getDomClass(), OutlinerPane);
	window.customElements.define(PTPChatPane.getDomClass(), PTPChatPane);
	window.customElements.define(SplashScreen.getDomClass(), SplashScreen);
	window.customElements.define(AnimationPane.getDomClass(), AnimationPane);

	window.customElements.define(DebugPane.getDomClass(), DebugPane);
	window.customElements.define(APIPanel.getDomClass(), APIPanel);
	window.customElements.define(PerformancePanel.getDomClass(), PerformancePanel);
	window.customElements.define(FileSystemPanel.getDomClass(), FileSystemPanel);
	window.customElements.define(SVTDebugPanel.getDomClass(), SVTDebugPanel);

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
	[AnimationPane.getDomClass()]: AnimationPane,
	[DebugPane.getDomClass()]: DebugPane,
	[FileSystemPanel.getDomClass()]: FileSystemPanel,
	[PerformancePanel.getDomClass()]: PerformancePanel,
	[OutputPane.getDomClass()]: OutputPane,
	[Collapsible.getDomClass()]: Collapsible,
	[Grid2Col.getDomClass()]: Grid2Col,
	[SpanElement.getDomClass()]: SpanElement,
	[SelectBox.getDomClass()]: SelectBox,
	[PTPChatContent.getDomClass()]: PTPChatContent,
	[PTPTextInput.getDomClass()]: PTPTextInput,
	[VBox.getDomClass()]: VBox,
	[Checkbox.getDomClass()]: Checkbox,
	[NumberInput.getDomClass()]: NumberInput,
};

export function buildUIElement(win: Window, kayo: Kayo, obj: any, argMap?: { [key: string]: string }): HTMLElement {
	return nameClassMap[obj.class].createUIElement(win, kayo, obj, argMap);
}

export interface UIElement {
	new(): unknown;
	createUIElement(win: Window, kayo: Kayo, obj: any, argMap?: { [key: string]: string }): HTMLElement;
	getDomClass(): string;
}

export interface UIPaneElement extends UIElement {
	getName(): string;
}
