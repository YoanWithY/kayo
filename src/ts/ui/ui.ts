import { ViewportPane } from "./ViewportPane";
import OutlinerPane, { OutlinerElement } from "./Outliner";
import { scene } from "../projection/Projection";
import RessourcePane from "./RessourcePane";
import PaneSelectorPane from "./PaneSelectorPane";

function commaSeperatedStringToNumberArray(s: string) {
    const sa = s.replace(/[^\d|,]/ig, "").split(",");
    const ar: number[] = [];
    for (let s of sa)
        ar.push(parseFloat(s));
    return ar;
}

class PaneStripe extends HTMLElement {
    static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pane-stripe-hight").replace("px", ""));
    static size2 = this.size * 2;

    static createPaneStripe() {
        return document.createElement("pane-stripe");
    }
}

class SplitablePane extends HTMLElement {

    static createSplitablePane(paneConstructor: (data: any) => HTMLElement, paneData?: any, orientation?: string, rect?: DOMRect): SplitablePane {
        const newSplitablePane = document.createElement("splitable-pane");
        const strip = PaneStripe.createPaneStripe();
        newSplitablePane.appendChild(strip);
        const pane = paneConstructor(paneData);
        newSplitablePane.appendChild(pane);

        newSplitablePane.append(
            document.createElement("split-button-ul"),
            document.createElement("split-button-ur"),
            document.createElement("split-button-ll"),
            document.createElement("split-button-lr"));

        if (orientation && rect) {
            if (orientation == "vertical")
                newSplitablePane.style.width = (rect.width - SplitPaneDivider.size) / 2 + "px";
            else
                newSplitablePane.style.height = (rect.height - SplitPaneDivider.size) / 2 + "px";
        }

        return newSplitablePane as SplitablePane;
    }

    getPaneStripe() {
        return this.children[0];
    }

    getContentPane() {
        return this.children[1];
    }

    removePrevious(container: SplitPaneContainer, orientation: string) {
        let prev = this.previousElementSibling;
        if (prev) // split pane divider
            container.removeChild(prev);

        if ((prev = this.previousElementSibling) instanceof HTMLElement) { // next spitable pane or split pane container
            if (orientation == "verical")
                this.style.width = this.getBoundingClientRect().width + SplitPaneDivider.size + prev.getBoundingClientRect().width + "px";
            else
                this.style.height = this.getBoundingClientRect().height + SplitPaneDivider.size + prev.getBoundingClientRect().height + "px";
            container.removeChild(prev);
        }
    }


    removeNext(container: SplitPaneContainer, orientation: string) {
        let next = this.nextElementSibling;
        if (next) // split pane divider
            container.removeChild(next);

        if ((next = this.nextElementSibling) instanceof HTMLElement) { // next spitable pane or split pane container
            if (orientation == "vertical")
                this.style.width = this.getBoundingClientRect().width + SplitPaneDivider.size + next.getBoundingClientRect().width + "px";
            else
                this.style.height = this.getBoundingClientRect().height + SplitPaneDivider.size + next.getBoundingClientRect().height + "px";
            container.removeChild(next);
        }
    }

    minHeight() {
        return PaneStripe.size2;
    }

    minWidth() {
        return PaneStripe.size2;
    }
}

class SplitPaneDivider extends HTMLElement {
    static color = commaSeperatedStringToNumberArray(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-color"));
    static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-size").replace("px", ""));
    isMouseDown = 0;
    constructor() {
        super();

        const mD = () => {
            this.isMouseDown = 1;
            document.body.addEventListener('mousemove', mV);
            document.body.addEventListener('mouseup', end);
        }

        const mV = (e: MouseEvent) => {
            e.preventDefault();
            if (this.isMouseDown === 1) {
                const parent = this.parentElement;
                if (!(parent instanceof SplitPaneContainer))
                    return;

                const prev = this.previousElementSibling;
                if (!(prev instanceof SplitPaneContainer || prev instanceof SplitablePane))
                    return;

                const next = this.nextElementSibling;
                if (!(next instanceof SplitPaneContainer || next instanceof SplitablePane))
                    return;

                const prevBB = prev.getBoundingClientRect();
                const nextBB = next.getBoundingClientRect();

                if (parent.getAttribute("split-pane-container-orientation") == "vertical") {

                    let prevNewWidth = Math.floor(Math.max(e.clientX - prevBB.x, prev.minWidth()));
                    let nextNewWidth = Math.floor(nextBB.width + (prevBB.width - prevNewWidth));
                    if (nextNewWidth < PaneStripe.size2) {
                        prevNewWidth -= PaneStripe.size2 - nextNewWidth;
                        nextNewWidth = PaneStripe.size2;
                    }
                    prev.style.width = prevNewWidth + "px";
                    next.style.width = nextNewWidth + "px";
                } else {
                    let prevNewHeight = Math.floor(Math.max(e.clientY - prevBB.y, prev.minHeight()));
                    let nextNewHeight = Math.floor(nextBB.height + (prevBB.height - prevNewHeight));

                    if (nextNewHeight < PaneStripe.size2) {
                        prevNewHeight -= PaneStripe.size2 - nextNewHeight;
                        nextNewHeight = PaneStripe.size2;
                    }

                    prev.style.height = prevNewHeight + "px";
                    next.style.height = nextNewHeight + "px";
                }
            } else
                end();
        }
        const end = () => {
            this.isMouseDown = 0;
            document.body.removeEventListener('mouseup', end);
            this.removeEventListener('mousemove', mV);
        }

        this.addEventListener("mousedown", mD);
    }

    static createSplitPaneDivider(orientation: string) {
        const spd = document.createElement("split-pane-divider");
        spd.setAttribute("split-pane-divider-orientation", orientation);
        return spd;
    }
}

class SplitPaneContainer extends HTMLElement {

    static createSplitPaneContainer(orientation: string, rect: DOMRect) {
        const c = document.createElement("split-pane-container");
        c.setAttribute("split-pane-container-orientation", orientation);
        if (orientation == "vertical") {
            c.style.height = rect.height + "px";
        } else {
            c.style.width = rect.width + "px";
        }

        return c;
    }

    static createRoot() {
        const c = document.createElement("split-pane-container");
        c.setAttribute("split-pane-container-orientation", "none");
        c.setAttribute("id", "wrapper");
        c.appendChild(SplitablePane.createSplitablePane(ViewportPane.createViewportPane));
        return c as SplitPaneContainer;
    }

    minHeight() {
        return Number.parseInt(this.style.minHeight.replace("px", ""));
    }

    minWidth() {
        return Number.parseInt(this.style.minWidth.replace("px", ""));
    }

    updateSizesRecursively() {
        const orientation = this.getAttribute("split-pane-container-orientation");
        if (orientation == "none") {
            const child = this.firstElementChild;
            if (child instanceof HTMLElement) {
                child.style.width = "";
                child.style.height = "";
            }
            this.style.minWidth = PaneStripe.size2 + "px";
            this.style.minHeight = PaneStripe.size2 + "px";
        } else if (orientation == "vertical") {
            let minWidth = 0;
            let minHeight = 0;
            this.childNodes.forEach((sp) => {
                if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
                    sp.style.height = "";
                    if (sp.nextElementSibling) {
                        sp.style.flex = "";
                        sp.style.width = sp.getBoundingClientRect().width + "px";
                    } else {
                        sp.style.flex = "1";
                        sp.style.width = sp.getBoundingClientRect().width + "px";
                    }
                    if (sp instanceof SplitPaneContainer)
                        sp.updateSizesRecursively();

                    minHeight = Math.max(minHeight, sp.minHeight());
                    minWidth += sp.minWidth();
                } else if (sp instanceof SplitPaneDivider) {
                    minWidth += SplitPaneDivider.size;
                }
            });
            this.style.minWidth = minWidth + "px";
            this.style.minHeight = minHeight + "px";

        } else {
            let minWidth = 0;
            let minHeight = 0;
            this.childNodes.forEach((sp) => {
                if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
                    sp.style.width = "";

                    if (sp.nextElementSibling) {
                        sp.style.flex = "";
                        sp.style.height = sp.getBoundingClientRect().height + "px";
                    } else {
                        sp.style.flex = "1";
                        sp.style.height = sp.getBoundingClientRect().height + "px";
                    }
                    if (sp instanceof SplitPaneContainer)
                        sp.updateSizesRecursively();

                    minHeight += sp.minHeight();
                    minWidth = Math.max(minWidth, sp.minWidth());
                } else if (sp instanceof SplitPaneDivider) {
                    minHeight += SplitPaneDivider.size;
                }
            });
            this.style.minWidth = minWidth + "px";
            this.style.minHeight = minHeight + "px";
        }
    }
}

export const rootSplitPaneContainer = SplitPaneContainer.createRoot();

abstract class SplitButton extends HTMLElement {

    clickX = NaN;
    clickY = NaN;
    constructor() {
        super();
        this.ondragstart = () => { return false; };
        this.onmousedown = e => {
            this.clickX = e.screenX;
            this.clickY = e.screenY;
        }
    }

    static checkContainerForSingle(container: SplitPaneContainer, splitablePane: SplitablePane) {
        if (container.childElementCount == 1) {
            if (container.getAttribute("id") == "wrapper") {
                container.setAttribute("split-pane-container-orientation", "none");
                return;
            }

            const containerParent = container.parentElement;
            if (!(containerParent instanceof SplitPaneContainer))
                throw new Error("container parent is not of type SplitPaneContainer");

            const co = container.getAttribute("split-pane-container-orientation");
            if (co == "vertical") {
                splitablePane.style.width = "";
                splitablePane.style.height = container.getBoundingClientRect().height + "px";
            } else {
                splitablePane.style.width = container.getBoundingClientRect().width + "px";
                splitablePane.style.height = "";
            }
            containerParent.replaceChild(splitablePane, container);
        }
    }

    static prepSplitablePanes(orientation: string, p1: SplitablePane, p2: SplitablePane, bb: DOMRect) {
        if (orientation == "vertical") {
            const width = (bb.width - SplitPaneDivider.size) / 2 + "px";
            p1.style.width = width;
            p2.style.width = width;
        } else {
            const height = (bb.height - SplitPaneDivider.size) / 2 + "px";
            p1.style.height = height;
            p2.style.height = height;
        }
    }
}

class SplitButtonUL extends SplitButton {
    private left(e: MouseEvent) {
        if (isNaN(this.clickX) || isNaN(this.clickY))
            return;

        const dx = e.screenX - this.clickX;
        const dy = e.screenY - this.clickY;

        this.clickX = NaN;
        this.clickY = NaN;

        const splitablePane = this.parentElement;
        if (!(splitablePane instanceof SplitablePane))
            throw new Error("splitable pane has no parent");

        const container = splitablePane.parentElement;
        if (!(container instanceof SplitPaneContainer))
            throw new Error("splitable panes parent is not of type SplitablePaneContainer");

        let spo = container.getAttribute("split-pane-container-orientation");

        if (dx >= 0 && Math.abs(dy) <= dx || dy >= 0 && Math.abs(dx) <= dy) { // create new window
            const orientation = dx >= dy ? "vertical" : "horizontal";

            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, { scene }, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }

            if (spo == orientation) { // append to splitpane container
                splitablePane.before(newSplitablePane, spDivider);
            } else { // insert new splitpane container
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                newContainer.append(newSplitablePane, spDivider, splitablePane);
            }
        } else if (dx <= dy && spo == "vertical" || dy <= dx && spo == "horizontal") { // remove window
            splitablePane.removePrevious(container, spo);
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        rootSplitPaneContainer.updateSizesRecursively();
    }

    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}

class SplitButtonUR extends SplitButton {

    private left(e: MouseEvent) {
        if (isNaN(this.clickX) || isNaN(this.clickY))
            return

        const dx = e.screenX - this.clickX;
        const dy = e.screenY - this.clickY;

        this.clickX = NaN;
        this.clickY = NaN;

        const splitablePane = this.parentElement;
        if (!(splitablePane instanceof SplitablePane))
            throw new Error("splitable pane has no parent");

        const container = splitablePane.parentElement;
        if (!(container instanceof SplitPaneContainer))
            throw new Error("splitable panes parent is not a SplitPaneContainer");

        let spo = container.getAttribute("split-pane-container-orientation");

        if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy >= 0 && Math.abs(dx) <= dy) { // create new window
            const orientation = Math.abs(dx) >= dy ? "vertical" : "horizontal";

            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }

            if (spo == orientation) {// append to splitpane container
                if (spo == "vertical") {
                    splitablePane.after(spDivider, newSplitablePane);
                } else {
                    splitablePane.before(newSplitablePane, spDivider);
                }
            } else { // insert new splitpane container
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                if (orientation == "vertical")
                    newContainer.append(splitablePane, spDivider, newSplitablePane);
                else
                    newContainer.append(newSplitablePane, spDivider, splitablePane);

            }
        } else { // remove window
            if (dx >= Math.abs(dy) && spo == "vertical") {
                splitablePane.removeNext(container, spo);
            } else if (dy <= Math.abs(dx) && spo == "horizontal") {
                splitablePane.removePrevious(container, spo);
            }
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        rootSplitPaneContainer.updateSizesRecursively();
    }

    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}

class SplitButtonLL extends SplitButton {

    private left(e: MouseEvent) {
        if (isNaN(this.clickX) || isNaN(this.clickY))
            return

        const dx = e.screenX - this.clickX;
        const dy = e.screenY - this.clickY;

        this.clickX = NaN;
        this.clickY = NaN;

        const splitablePane = this.parentElement;
        if (!(splitablePane instanceof SplitablePane))
            throw new Error("splitable pane has no parent");

        const container = splitablePane.parentElement;
        if (!(container instanceof SplitPaneContainer))
            throw new Error("splitable panes parent is not a SplitPaneContainer");

        let spo = container.getAttribute("split-pane-container-orientation");

        if (dx >= 0 && Math.abs(dy) <= dx || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) { // create new window
            const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }

            if (spo == orientation) { // append to splitpane container
                if (spo == "vertical") {
                    splitablePane.before(newSplitablePane, spDivider);
                } else {
                    splitablePane.after(spDivider, newSplitablePane);
                }
            } else { // insert new splitpane container
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.replaceChild(newContainer, splitablePane);
                if (orientation == "vertical")
                    newContainer.append(newSplitablePane, spDivider, splitablePane);
                else
                    newContainer.append(splitablePane, spDivider, newSplitablePane);

            }
        } else {
            if (dx <= Math.abs(dy) && spo == "vertical") { // remove window
                splitablePane.removePrevious(container, spo);
            } else if (dy >= Math.abs(dx) && spo == "horizontal") {
                splitablePane.removeNext(container, spo);
            }
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        rootSplitPaneContainer.updateSizesRecursively();
    }

    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}

class SplitButtonLR extends SplitButton {

    private left(e: MouseEvent) {
        if (isNaN(this.clickX) || isNaN(this.clickY))
            return

        const dx = e.screenX - this.clickX;
        const dy = e.screenY - this.clickY;

        this.clickX = NaN;
        this.clickY = NaN;

        const splitablePane = this.parentElement;
        if (!(splitablePane instanceof SplitablePane))
            throw new Error("splitable pane has no parent");

        const container = splitablePane.parentElement;
        if (!(container instanceof SplitPaneContainer))
            throw new Error("splitable panes parent is null");

        let spo = container.getAttribute("split-pane-container-orientation");

        if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) { // create new window
            const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }

            if (spo == orientation) { // append to splitpane container
                splitablePane.after(spDivider, newSplitablePane);
            } else { // insert new splitpane container
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                newContainer.append(splitablePane, spDivider, newSplitablePane);
            }
        } else if (dx >= dy && spo == "vertical" || dy >= dx && spo == "horizontal") { // remove window
            splitablePane.removeNext(container, spo);
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        rootSplitPaneContainer.updateSizesRecursively();
    }

    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}

window.customElements.define("pane-stripe", PaneStripe);
window.customElements.define("viewport-pane", ViewportPane);
window.customElements.define("ressource-pane", RessourcePane);
window.customElements.define("pane-selector-pane", PaneSelectorPane);
window.customElements.define("outliner-element", OutlinerElement)
window.customElements.define("outliner-pane", OutlinerPane);
window.customElements.define("split-button-ul", SplitButtonUL);
window.customElements.define("split-button-ur", SplitButtonUR);
window.customElements.define("split-button-ll", SplitButtonLL);
window.customElements.define("split-button-lr", SplitButtonLR);
window.customElements.define("split-pane-divider", SplitPaneDivider);
window.customElements.define("split-pane-container", SplitPaneContainer);
window.customElements.define("splitable-pane", SplitablePane);