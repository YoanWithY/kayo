import { KayoInstance } from "../../../../KayoInstance/ts/KayoInstance";
import { Renderer } from "../../../../KayoInstance/ts/Renderer";
import { PerformancePanel } from "./PerformancePanel";

export class PerformanceRenderer implements Renderer {
	public static readonly rendererKey = "__kayo__performance";
	private _registeredViewports: Set<PerformancePanel>;
	private _kayo: KayoInstance;
	public constructor(kayo: KayoInstance) {
		this._kayo = kayo;
		this._registeredViewports = new Set();
	}
	public get rendererKey() {
		return PerformanceRenderer.rendererKey;
	}

	public get registeredViewports() {
		return this._registeredViewports;
	}

	public renderViewport(_: PerformancePanel): void {

	}
	public registerViewport(viewport: PerformancePanel): void {
		this._registeredViewports.add(viewport);
	}
	public unregisterViewport(viewport: PerformancePanel): void {
		this._registeredViewports.delete(viewport);
	}
}
