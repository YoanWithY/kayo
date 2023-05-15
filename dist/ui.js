"use strict";
var _a, _b;
function commaSeperatedStringToNumberArray(s) {
    const sa = s.replace(/[^\d|,]/ig, "").split(",");
    const ar = [];
    for (let s of sa)
        ar.push(parseFloat(s));
    return ar;
}
class PaneStripe extends HTMLElement {
    static createPaneStripe() {
        return document.createElement("pane-stripe");
    }
}
_a = PaneStripe;
PaneStripe.size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pane-stripe-hight").replace("px", ""));
PaneStripe.size2 = _a.size * 2;
class SelectionPane extends HTMLElement {
    static createSelectionPane(data) {
        const p = document.createElement("selection-pane");
        return p;
    }
}
class ViewPortPane extends HTMLElement {
    set r(r) {
        this._r = Math.max(r, this.near);
    }
    get r() {
        return this._r;
    }
    constructor() {
        super();
        this.framebuffer = new FrameBuffer();
        this.resizeObserver = new ResizeObserver((entries, obersver) => {
            const b = entries[0].devicePixelContentBoxSize[0];
            this.framebuffer.init(b.inlineSize, b.blockSize);
        });
        this.sceneCamera = null;
        this.lookAtPos = [0, 0, 0];
        this.theta = 1.1;
        this.phi = 0.5;
        this._r = 4;
        this.near = 0.1;
        this.far = 1000;
        this.FOV = 1.0;
        const rotateView = (dx, dy) => {
            this.phi -= dx / 256;
            this.theta -= dy / 256;
        };
        const shiftView = (dx, dy) => {
            const lat = vec3.latitudeTangent(this.phi);
            const lon = vec3.longitudeTangent(this.theta, this.phi);
            this.lookAtPos = vec3.add(this.lookAtPos, vec3.add(vec3.scalarMul(lat, -dx / 1024 * this.r), vec3.scalarMul(lon, -dy / 1024 * this.r)));
        };
        const move = (e) => {
            if (e.shiftKey)
                shiftView(e.movementX, e.movementY);
            else
                rotateView(e.movementX, e.movementY);
        };
        const mm = (e) => {
            if (e.buttons === 1 && !document.pointerLockElement) {
                this.requestPointerLock();
                this.addEventListener("mousemove", move);
                move(e);
            }
        };
        this.onmousedown = e => {
            this.addEventListener("mousemove", mm);
        };
        this.onmouseup = e => {
            this.removeEventListener("mousemove", move);
            this.removeEventListener("mousemove", mm);
            document.exitPointerLock();
        };
        this.addEventListener("wheel", e => {
            e.preventDefault();
            const val = e.deltaY / window.devicePixelRatio;
            this.r += this.r * val / 1024;
        });
        const touches = [];
        this.addEventListener("touchstart", e => {
            for (const t of e.touches)
                touches[t.identifier] = t;
        });
        this.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const thisT = e.touches[0];
                const lastT = touches[thisT.identifier];
                rotateView(thisT.clientX - lastT.clientX, thisT.clientY - lastT.clientY);
                touches[thisT.identifier] = thisT;
            }
            else if (e.touches.length === 2) {
                const thisT1 = e.touches[0];
                const lastT1 = touches[thisT1.identifier];
                const thisT2 = e.touches[1];
                const lastT2 = touches[thisT2.identifier];
                const dx1 = thisT1.clientX - lastT1.clientX;
                const dy1 = thisT1.clientY - lastT1.clientY;
                const dx2 = thisT2.clientX - lastT2.clientX;
                const dy2 = thisT2.clientY - lastT2.clientY;
                const lastD = vec2.distance(lastT1.clientX, lastT1.clientY, lastT2.clientX, lastT2.clientY);
                const thisD = vec2.distance(thisT1.clientX, thisT1.clientY, thisT2.clientX, thisT2.clientY);
                const zoom = lastD / thisD;
                touches[thisT1.identifier] = thisT1;
                touches[thisT2.identifier] = thisT2;
                this.r *= zoom;
                shiftView((dx1 + dx2) / 2, (dy1 + dy2) / 2);
            }
        });
        this.addEventListener("touchend", e => {
            for (const t of e.changedTouches)
                delete touches[t.identifier];
        });
        this.resizeObserver.observe(this, { box: "device-pixel-content-box" });
    }
    static createViewportPane(data) {
        const p = document.createElement("viewport-pane");
        return p;
    }
    getProjectionMatrix() {
        return mat4.perspective(this.FOV, this.framebuffer.width / this.framebuffer.height, this.near, this.far);
    }
    getViewMatrix() {
        const z = vec3.sphericalToEuclidian(this.theta, this.phi);
        const p = vec3.add(this.lookAtPos, vec3.scalarMul(z, this._r));
        const m = mat4.translation(-p[0], -p[1], -p[2]);
        return mat4.mult(mat4.transpose(mat4.fromVec3s(vec3.latitudeTangent(this.phi), vec3.scalarMul(vec3.longitudeTangent(this.theta, this.phi), -1), z)), m);
    }
    ;
    getWorldLocation() {
        return vec3.add(this.lookAtPos, vec3.sphericalToEuclidian(this.theta, this.phi, this._r));
    }
    getGLViewport() {
        const rect = this.getBoundingClientRect();
        const dpr = window.devicePixelRatio;
        return [rect.left * dpr, gl.canvas.height - rect.bottom * dpr, this.framebuffer.width, this.framebuffer.height];
    }
    applyToCanvas() {
        const bb = this.getGLViewport();
        gl.viewport(...bb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.framebuffer.blitToActiveFramebuffer();
    }
    disconnectedCallback() {
        ViewPortPane.viewports.delete(this);
    }
    connectedCallback() {
        if (this.isConnected) {
            ViewPortPane.viewports.add(this);
        }
    }
}
ViewPortPane.viewports = new Set;
class SplitablePane extends HTMLElement {
    static createSplitablePane(paneConstructor, paneData, orientation, rect) {
        const newSplitablePane = document.createElement("splitable-pane");
        const strip = PaneStripe.createPaneStripe();
        newSplitablePane.appendChild(strip);
        const pane = paneConstructor(paneData);
        newSplitablePane.appendChild(pane);
        newSplitablePane.append(document.createElement("split-button-ul"), document.createElement("split-button-ur"), document.createElement("split-button-ll"), document.createElement("split-button-lr"));
        if (orientation && rect) {
            if (orientation == "vertical")
                newSplitablePane.style.width = (rect.width - SplitPaneDivider.size) / 2 + "px";
            else
                newSplitablePane.style.height = (rect.height - SplitPaneDivider.size) / 2 + "px";
        }
        return newSplitablePane;
    }
    getPaneStripe() {
        return this.children[0];
    }
    getContentPane() {
        return this.children[1];
    }
    removePrevious(container, orientation) {
        let prev = this.previousElementSibling;
        if (prev)
            container.removeChild(prev);
        if ((prev = this.previousElementSibling) instanceof HTMLElement) {
            if (orientation == "verical")
                this.style.width = this.getBoundingClientRect().width + SplitPaneDivider.size + prev.getBoundingClientRect().width + "px";
            else
                this.style.height = this.getBoundingClientRect().height + SplitPaneDivider.size + prev.getBoundingClientRect().height + "px";
            container.removeChild(prev);
        }
    }
    removeNext(container, orientation) {
        let next = this.nextElementSibling;
        if (next)
            container.removeChild(next);
        if ((next = this.nextElementSibling) instanceof HTMLElement) {
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
    constructor() {
        super();
        this.isMouseDown = 0;
        this.ondragstart = e => { return false; };
        const mD = (event) => {
            this.isMouseDown = 1;
            document.body.addEventListener('mousemove', mV);
            document.body.addEventListener('mouseup', end);
        };
        const mV = (e) => {
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
                }
                else {
                    let prevNewHeight = Math.floor(Math.max(e.clientY - prevBB.y, prev.minHeight()));
                    let nextNewHeight = Math.floor(nextBB.height + (prevBB.height - prevNewHeight));
                    if (nextNewHeight < PaneStripe.size2) {
                        prevNewHeight -= PaneStripe.size2 - nextNewHeight;
                        nextNewHeight = PaneStripe.size2;
                    }
                    prev.style.height = prevNewHeight + "px";
                    next.style.height = nextNewHeight + "px";
                }
            }
            else
                end();
        };
        const end = () => {
            this.isMouseDown = 0;
            document.body.removeEventListener('mouseup', end);
            this.removeEventListener('mousemove', mV);
        };
        this.addEventListener("mousedown", mD);
    }
    static createSplitPaneDivider(orientation) {
        const spd = document.createElement("split-pane-divider");
        spd.setAttribute("split-pane-divider-orientation", orientation);
        return spd;
    }
}
SplitPaneDivider.color = commaSeperatedStringToNumberArray(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-color"));
(() => {
    gl.clearColor(SplitPaneDivider.color[0] / 255, SplitPaneDivider.color[1] / 255, SplitPaneDivider.color[2] / 255, 1.0);
})();
SplitPaneDivider.size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-size").replace("px", ""));
class SplitPaneContainer extends HTMLElement {
    static createSplitPaneContainer(orientation, rect) {
        const c = document.createElement("split-pane-container");
        c.setAttribute("split-pane-container-orientation", orientation);
        if (orientation == "vertical") {
            c.style.height = rect.height + "px";
        }
        else {
            c.style.width = rect.width + "px";
        }
        return c;
    }
    static createRoot() {
        const c = document.createElement("split-pane-container");
        c.setAttribute("split-pane-container-orientation", "none");
        c.setAttribute("id", "wrapper");
        c.appendChild(SplitablePane.createSplitablePane(ViewPortPane.createViewportPane));
        return c;
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
        }
        else if (orientation == "vertical") {
            let minWidth = 0;
            let minHeight = 0;
            this.childNodes.forEach((sp, key, parent) => {
                if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
                    sp.style.height = "";
                    if (sp.nextElementSibling) {
                        sp.style.flex = "";
                        sp.style.width = sp.getBoundingClientRect().width + "px";
                    }
                    else {
                        sp.style.flex = "1";
                        sp.style.width = sp.getBoundingClientRect().width + "px";
                    }
                    if (sp instanceof SplitPaneContainer)
                        sp.updateSizesRecursively();
                    minHeight = Math.max(minHeight, sp.minHeight());
                    minWidth += sp.minWidth();
                }
                else if (sp instanceof SplitPaneDivider) {
                    minWidth += SplitPaneDivider.size;
                }
            });
            this.style.minWidth = minWidth + "px";
            this.style.minHeight = minHeight + "px";
        }
        else {
            let minWidth = 0;
            let minHeight = 0;
            this.childNodes.forEach((sp, key, parent) => {
                if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
                    sp.style.width = "";
                    if (sp.nextElementSibling) {
                        sp.style.flex = "";
                        sp.style.height = sp.getBoundingClientRect().height + "px";
                    }
                    else {
                        sp.style.flex = "1";
                        sp.style.height = sp.getBoundingClientRect().height + "px";
                    }
                    if (sp instanceof SplitPaneContainer)
                        sp.updateSizesRecursively();
                    minHeight += sp.minHeight();
                    minWidth = Math.max(minWidth, sp.minWidth());
                }
                else if (sp instanceof SplitPaneDivider) {
                    minHeight += SplitPaneDivider.size;
                }
            });
            this.style.minWidth = minWidth + "px";
            this.style.minHeight = minHeight + "px";
        }
    }
}
_b = SplitPaneContainer;
SplitPaneContainer.rootSplitPaneContainer = SplitPaneContainer.createRoot();
(() => {
    document.body.appendChild(_b.rootSplitPaneContainer);
})();
class SplitButton extends HTMLElement {
    constructor() {
        super();
        this.clickX = NaN;
        this.clickY = NaN;
        this.ondragstart = e => { return false; };
        this.onmousedown = e => {
            this.clickX = e.screenX;
            this.clickY = e.screenY;
        };
    }
    static checkContainerForSingle(container, splitablePane) {
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
            }
            else {
                splitablePane.style.width = container.getBoundingClientRect().width + "px";
                splitablePane.style.height = "";
            }
            containerParent.replaceChild(splitablePane, container);
        }
    }
    static prepSplitablePanes(orientation, p1, p2, bb) {
        if (orientation == "vertical") {
            const width = (bb.width - SplitPaneDivider.size) / 2 + "px";
            p1.style.width = width;
            p2.style.width = width;
        }
        else {
            const height = (bb.height - SplitPaneDivider.size) / 2 + "px";
            p1.style.height = height;
            p2.style.height = height;
        }
    }
}
class SplitButtonUL extends SplitButton {
    left(e) {
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
        if (dx >= 0 && Math.abs(dy) <= dx || dy >= 0 && Math.abs(dx) <= dy) {
            const orientation = dx >= dy ? "vertical" : "horizontal";
            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(ViewPortPane.createViewportPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);
            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }
            if (spo == orientation) {
                splitablePane.before(newSplitablePane, spDivider);
            }
            else {
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                newContainer.append(newSplitablePane, spDivider, splitablePane);
            }
        }
        else if (dx <= dy && spo == "vertical" || dy <= dx && spo == "horizontal") {
            splitablePane.removePrevious(container, spo);
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        SplitPaneContainer.rootSplitPaneContainer.updateSizesRecursively();
    }
    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}
class SplitButtonUR extends SplitButton {
    left(e) {
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
            throw new Error("splitable panes parent is not a SplitPaneContainer");
        let spo = container.getAttribute("split-pane-container-orientation");
        if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy >= 0 && Math.abs(dx) <= dy) {
            const orientation = Math.abs(dx) >= dy ? "vertical" : "horizontal";
            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(SelectionPane.createSelectionPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);
            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }
            if (spo == orientation) {
                if (spo == "vertical") {
                    splitablePane.after(spDivider, newSplitablePane);
                }
                else {
                    splitablePane.before(newSplitablePane, spDivider);
                }
            }
            else {
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                if (orientation == "vertical")
                    newContainer.append(splitablePane, spDivider, newSplitablePane);
                else
                    newContainer.append(newSplitablePane, spDivider, splitablePane);
            }
        }
        else {
            if (dx >= Math.abs(dy) && spo == "vertical") {
                splitablePane.removeNext(container, spo);
            }
            else if (dy <= Math.abs(dx) && spo == "horizontal") {
                splitablePane.removePrevious(container, spo);
            }
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        SplitPaneContainer.rootSplitPaneContainer.updateSizesRecursively();
    }
    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}
class SplitButtonLL extends SplitButton {
    left(e) {
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
            throw new Error("splitable panes parent is not a SplitPaneContainer");
        let spo = container.getAttribute("split-pane-container-orientation");
        if (dx >= 0 && Math.abs(dy) <= dx || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) {
            const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";
            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(SelectionPane.createSelectionPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);
            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }
            if (spo == orientation) {
                if (spo == "vertical") {
                    splitablePane.before(newSplitablePane, spDivider);
                }
                else {
                    splitablePane.after(spDivider, newSplitablePane);
                }
            }
            else {
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.replaceChild(newContainer, splitablePane);
                if (orientation == "vertical")
                    newContainer.append(newSplitablePane, spDivider, splitablePane);
                else
                    newContainer.append(splitablePane, spDivider, newSplitablePane);
            }
        }
        else {
            if (dx <= Math.abs(dy) && spo == "vertical") {
                splitablePane.removePrevious(container, spo);
            }
            else if (dy >= Math.abs(dx) && spo == "horizontal") {
                splitablePane.removeNext(container, spo);
            }
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        SplitPaneContainer.rootSplitPaneContainer.updateSizesRecursively();
    }
    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}
class SplitButtonLR extends SplitButton {
    left(e) {
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
            throw new Error("splitable panes parent is null");
        let spo = container.getAttribute("split-pane-container-orientation");
        if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) {
            const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";
            const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
            const newSplitablePane = SplitablePane.createSplitablePane(SelectionPane.createSelectionPane, null, orientation, splitablePane.getBoundingClientRect());
            const bb = splitablePane.getBoundingClientRect();
            SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);
            if (spo == "none") {
                container.setAttribute("split-pane-container-orientation", orientation);
                spo = orientation;
            }
            if (spo == orientation) {
                splitablePane.after(spDivider, newSplitablePane);
            }
            else {
                const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
                container.insertBefore(newContainer, splitablePane);
                newContainer.append(splitablePane, spDivider, newSplitablePane);
            }
        }
        else if (dx >= dy && spo == "vertical" || dy >= dx && spo == "horizontal") {
            splitablePane.removeNext(container, spo);
            SplitButton.checkContainerForSingle(container, splitablePane);
        }
        SplitPaneContainer.rootSplitPaneContainer.updateSizesRecursively();
    }
    constructor() {
        super();
        this.onmouseleave = this.left;
    }
}
window.customElements.define("pane-stripe", PaneStripe);
window.customElements.define("viewport-pane", ViewPortPane);
window.customElements.define("selection-pane", SelectionPane);
window.customElements.define("split-button-ul", SplitButtonUL);
window.customElements.define("split-button-ur", SplitButtonUR);
window.customElements.define("split-button-ll", SplitButtonLL);
window.customElements.define("split-button-lr", SplitButtonLR);
window.customElements.define("split-pane-divider", SplitPaneDivider);
window.customElements.define("split-pane-container", SplitPaneContainer);
window.customElements.define("splitable-pane", SplitablePane);
