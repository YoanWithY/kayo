import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import { SplitPaneDivider, splitPaneDividerSize } from "./SplitPaneDivider";
import css from "./SplitPaneGrabber.css?inline";


export class SplitPaneGrabber extends HTMLElement {
    public window!: Window;
    public splitPaneDividerSize!: number;
    private _isMouseDown: boolean = false;
    private _end = () => {
        this._isMouseDown = false;
        this.window.document.body.removeEventListener("pointermove", this._mouseMove);
        this.window.document.body.removeEventListener("pointerup", this._end);
    };
    private _mouseMove = (e: PointerEvent) => {
        e.preventDefault();
        if (this._isMouseDown) {
            const divider = this.parentElement as SplitPaneDivider | null;
            if (!divider || divider.nodeName !== "SPLIT-PANE-DIVIDER")
                return;

            const parent = divider.parentElement as SplitPaneContainer | null;
            if (!parent || parent.nodeName !== "SPLIT-PANE-CONTAINER")
                return;

            const prev = divider.previousElementSibling as SplitPaneContainer | SplitablePane<any> | null;
            if (!prev || (prev.nodeName !== "SPLIT-PANE-CONTAINER" && prev.nodeName !== "SPLITABLE-PANE"))
                return;

            const next = divider.nextElementSibling as SplitPaneContainer | SplitablePane<any> | null;
            if (!next || (next.nodeName !== "SPLIT-PANE-CONTAINER" && next.nodeName !== "SPLITABLE-PANE"))
                return;

            const prevBB = prev.getBoundingClientRect();
            const nextBB = next.getBoundingClientRect();

            if (parent.getAttribute("split-pane-container-orientation") == "vertical") {
                let prevNewWidth = Math.floor(Math.max(e.clientX - prevBB.x, prev.minWidth()));
                let nextNewWidth = Math.floor(nextBB.width + (prevBB.width - prevNewWidth));
                if (nextNewWidth < this.splitPaneDividerSize) {
                    prevNewWidth -= this.splitPaneDividerSize - nextNewWidth;
                    nextNewWidth = this.splitPaneDividerSize;
                }
                prev.style.width = prevNewWidth + "px";
                next.style.width = nextNewWidth + "px";
            } else {
                let prevNewHeight = Math.floor(Math.max(e.clientY - prevBB.y, prev.minHeight()));
                let nextNewHeight = Math.floor(nextBB.height + (prevBB.height - prevNewHeight));

                if (nextNewHeight < this.splitPaneDividerSize) {
                    prevNewHeight -= this.splitPaneDividerSize - nextNewHeight;
                    nextNewHeight = this.splitPaneDividerSize;
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
        grabber.splitPaneDividerSize = splitPaneDividerSize;
        return grabber;
    }
    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }
}
