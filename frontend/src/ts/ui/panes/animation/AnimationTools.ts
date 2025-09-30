import { FCurveConstantSegment } from "../../../../c/KayoCorePP";
import { Kayo } from "../../../Kayo";
import { getWindowZoom } from "../../../Utils";
import { AnimationPane } from "./AnimationPane";

export abstract class AnimationTool {
	protected _kayo: Kayo;
	protected _animationPane: AnimationPane;
	public constructor(kayo: Kayo, animationPane: AnimationPane) {
		this._kayo = kayo;
		this._animationPane = animationPane;
	}
	public abstract handlePointerDown(e: PointerEvent): void;
	public abstract handlePointerUp(e: PointerEvent): void;
	public abstract handlePointerMove(e: PointerEvent): void;
}

export class ViewTool extends AnimationTool {
	public handlePointerDown(_: PointerEvent): void {}
	public handlePointerUp(_: PointerEvent): void {}
	public handlePointerMove(e: PointerEvent): void {
		const previousPointerEvents = this._animationPane.previousPointerEvents;
		const pointeCount = Object.keys(previousPointerEvents).length;
		if (pointeCount === 0) return;

		const KN = this._kayo.wasmx.KN;
		const win = this._animationPane.window;
		const dpr = win.devicePixelRatio;

		const origin = this._animationPane.origin;
		const contentScale = this._animationPane.contentScale;

		if (pointeCount === 1) {
			const prevPointer = previousPointerEvents[e.pointerId];
			if (prevPointer === undefined) {
				console.error("Could not find previous poiner!");
				return;
			}
			const movementX = (e.offsetX - prevPointer.offsetX) * dpr;
			const movementY = (e.offsetY - prevPointer.offsetY) * dpr;
			origin[0] = KN.subn(origin[0], movementX / contentScale[0]);
			origin[1] = KN.subn(origin[1], movementY / contentScale[1]);
			this._kayo.project.fullRerender();
		} else if (pointeCount === 2) {
			const thisPointer = e;
			const prevPointer = previousPointerEvents[thisPointer.pointerId];
			if (prevPointer === undefined) {
				console.error("Could not find previous poiner!");
				return;
			}
			const findCallback = (v: PointerEvent) => v.pointerId != thisPointer.pointerId;
			const otherPointer = Object.values(previousPointerEvents).find(findCallback);
			if (otherPointer === undefined) {
				console.error("Could not find other pointer!");
				return;
			}

			const prevDx = Math.abs(prevPointer.offsetX - otherPointer.offsetX) * dpr;
			const thisDx = Math.abs(thisPointer.offsetX - otherPointer.offsetX) * dpr;
			const zoomX = thisDx >= 32 && prevDx >= 32 ? thisDx / prevDx : 1;

			const prevDy = Math.abs(prevPointer.screenY - otherPointer.screenY) * dpr;
			const thisDy = Math.abs(thisPointer.screenY - otherPointer.screenY) * dpr;
			const zoomY = thisDy >= 32 && prevDy >= 32 ? thisDy / prevDy : 1;

			const oldSource = this._animationPane.mapToSource(prevPointer.offsetX * dpr, prevPointer.offsetY * dpr);
			contentScale[0] *= zoomX;
			contentScale[1] *= zoomY;
			const newSource = this._animationPane.mapToSource(thisPointer.offsetX * dpr, thisPointer.offsetY * dpr);
			origin[0] = KN.add(origin[0], KN.sub(oldSource[0], newSource[0]));
			origin[1] = KN.add(origin[1], KN.sub(oldSource[1], newSource[1]));
			this._kayo.project.fullRerender();
		}
	}
	public handleWheel(e: WheelEvent): void {
		const KN = this._kayo.wasmx.KN;
		const origin = this._animationPane.origin;
		const contentScale = this._animationPane.contentScale;
		const winZoom = getWindowZoom(this._animationPane.window);
		if (e.deltaMode == 0) {
			const dpr = this._animationPane.window.devicePixelRatio;
			const oldSource = this._animationPane.mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			this._animationPane.setContentScale(
				contentScale[0] - ((contentScale[0] * e.deltaY) / 512) * winZoom,
				contentScale[1] - ((contentScale[1] * e.deltaY) / 512) * winZoom,
			);
			const newSource = this._animationPane.mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			origin[0] = KN.add(origin[0], KN.sub(oldSource[0], newSource[0]));
			origin[1] = KN.add(origin[1], KN.sub(oldSource[1], newSource[1]));
			this._kayo.project.fullRerender();
		}
	}
	public static get toolname() {
		return "view";
	}
}

export class AddKnotTool extends AnimationTool {
	public handlePointerDown(e: PointerEvent): void {
		const dpr = this._animationPane.window.devicePixelRatio;
		const source = this._animationPane.mapToSource(e.offsetX * dpr, e.offsetY * dpr);
		const curve = this._kayo.wasmx.kayoInstance.project.timeLine.simulationTimeVelocity;
		curve.insertKnot(source[0], source[1], true);
		this._kayo.project.fullRerender();
	}
	public handlePointerUp(_: PointerEvent): void {}
	public handlePointerMove(_: PointerEvent): void {}
	public static get toolname() {
		return "add";
	}
}

export class EditTool extends AnimationTool {
	protected _handleNewLocation(e: PointerEvent) {
		const active = this._animationPane.activeSegment;
		if (!active) return;

		const dpr = this._animationPane.window.devicePixelRatio;
		const y = this._animationPane.mapToSourceY(e.offsetY * dpr);

		const Type = this._kayo.wasmx.wasm.FCurveSegmentType;
		switch (active.type) {
			case Type.CONSTANT: {
				const constant = active as FCurveConstantSegment;
				const SegmentMode = this._kayo.wasmx.wasm.FCurveConstantSegmentMode;
				if (constant.valueMode == SegmentMode.VALUE) {
					constant.value = y;
				} else if (constant.valueMode == SegmentMode.LEFT_KNOT) {
					const leftKnot = constant.leftKnot;
					if (!leftKnot) {
						console.error("No left knot!");
						return;
					}
					leftKnot.y = y;
				} else {
					const rightKnot = constant.rightKnot;
					if (!rightKnot) {
						console.error("No right knot!");
						return;
					}
					rightKnot.y = y;
				}

				break;
			}
		}
		this._kayo.project.fullRerender();
	}

	public handlePointerDown(e: PointerEvent): void {
		this._animationPane.setClosestActive(e);
		this._handleNewLocation(e);
	}
	public handlePointerUp(_: PointerEvent): void {}
	public handlePointerMove(e: PointerEvent): void {
		this._handleNewLocation(e);
	}
	public static get toolname() {
		return "edit";
	}
}

export const animationTools = {
	[ViewTool.toolname]: ViewTool,
	[AddKnotTool.toolname]: AddKnotTool,
	[EditTool.toolname]: EditTool,
};
