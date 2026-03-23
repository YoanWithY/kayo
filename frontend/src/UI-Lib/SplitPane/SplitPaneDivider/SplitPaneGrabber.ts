import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import { SplitPaneDivider } from "./SplitPaneDivider";
import css from "./SplitPaneGrabber.css?inline";


export class SplitPaneGrabber extends HTMLElement {
    public window!: Window;
    private _isMouseDown: boolean = false;
    private _end = () => {
        this._isMouseDown = false;
        this.window.document.body.removeEventListener("pointermove", this._mouseMove);
        this.window.document.body.removeEventListener("pointerup", this._end);
    };
    private _mouseMove = (e: PointerEvent) => {
        e.preventDefault();
        if (this._isMouseDown) {
            const divider = this.parentElement;
            if (!(divider instanceof SplitPaneDivider)) return;

            const parent = divider.parentElement;
            if (!(parent instanceof SplitPaneContainer)) return;

            const prev = divider.previousElementSibling;
            if (!(prev instanceof SplitPaneContainer || prev instanceof SplitablePane)) return;

            const next = divider.nextElementSibling;
            if (!(next instanceof SplitPaneContainer || next instanceof SplitablePane)) return;

            const prevBB = prev.getBoundingClientRect();
            const nextBB = next.getBoundingClientRect();

            if (parent.getAttribute("split-pane-container-orientation") == "vertical") {
                let prevNewWidth = Math.floor(Math.max(e.clientX - prevBB.x, prev.minWidth()));
                let nextNewWidth = Math.floor(nextBB.width + (prevBB.width - prevNewWidth));
                if (nextNewWidth < SplitablePane.minSize) {
                    prevNewWidth -= SplitablePane.minSize - nextNewWidth;
                    nextNewWidth = SplitablePane.minSize;
                }
                prev.style.width = prevNewWidth + "px";
                next.style.width = nextNewWidth + "px";
            } else {
                let prevNewHeight = Math.floor(Math.max(e.clientY - prevBB.y, prev.minHeight()));
                let nextNewHeight = Math.floor(nextBB.height + (prevBB.height - prevNewHeight));

                if (nextNewHeight < SplitablePane.minSize) {
                    prevNewHeight -= SplitablePane.minSize - nextNewHeight;
                    nextNewHeight = SplitablePane.minSize;
                }

                prev.style.height = prevNewHeight + "px";
                next.style.height = nextNewHeight + "px";
            }
        } else this._end();
    };

    private _pointerDownCallback = () => {
        this._isMouseDown = true;
        this.window.document.body.addEventListener("pointermove", this._mouseMove);
        this.window.document.body.addEventListener("pointerup", this._end);
    };

    protected connectedCallback() {
        this.addEventListener("pointerdown", this._pointerDownCallback, { capture: false });
    }

    protected disconnectedCallback() {
        this.removeEventListener("pointerdown", this._pointerDownCallback, { capture: false });
    }
}

export class SplitPaneGrabberBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitPaneGrabber> {
    protected _domClassName = "split-pane-grabber";
    protected get _domClass() {
        return SplitPaneGrabber;
    }
    public build(windowUIBuilder: WindowUIBuilder<T>, _: { domClassName: string; }) {
        const grabber = windowUIBuilder.createElement<SplitPaneGrabber>(this._domClassName);
        grabber.window = windowUIBuilder.window;
        return grabber;
    }
    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }

}
