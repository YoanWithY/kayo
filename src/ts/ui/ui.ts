import { ViewportPane } from "./panes/ViewportPane";
import OutlinerPane, { OutlinerElement } from "./panes/OutlinerPane";
import RessourcePane from "./panes/RessourcePane";
import PaneSelectorPane from "./panes/PaneSelectorPane";
import OutputPane from "./panes/OutputPane";
import { SplitPaneContainer } from "./splitpane/SplitPaneContainer";
import { SplitButtonLL, SplitButtonLR, SplitButtonUL, SplitButtonUR } from "./splitpane/SplitButton";
import { SplitPaneDivider } from "./splitpane/SplitPaneDivider";
import { SplitablePane } from "./splitpane/SplitablePane";
import { PaneStripe } from "./panes/PaneStripe";

window.customElements.define("pane-stripe", PaneStripe);

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
window.customElements.define("split-pane-container", SplitPaneContainer);
window.customElements.define("splitable-pane", SplitablePane);

export const rootSplitPaneContainer = SplitPaneContainer.createRoot();