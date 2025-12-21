import { allocPubID, dispatchValue } from "../../PubSub";
import RealtimeRenderer from "../RealtimeRenderer";
import { SpecificRenderConfig } from "./RenderConfig";

export class RealtimeAntialiasingRenderConfig {
	private _msaa: 1 | 4 = 1;
	private _interpolation: "center" | "centroid" | "sample" = "center";

	private _msaa_pubID = allocPubID();
	private _interpolation_pubID = allocPubID();

	public get msaa() {
		return this._msaa;
	}
	public set msaa(v: 1 | 4) {
		this._msaa = v;
		dispatchValue(this._msaa_pubID, this._msaa);
	}
	public get interpolation() {
		return this._interpolation;
	}
	public set interpolation(v: "center" | "centroid" | "sample") {
		this._interpolation = v;
		dispatchValue(this._interpolation_pubID, v);
	}
	public get msaa_pubID() {
		return this._msaa_pubID;
	}
	public get interpolation_pubID() {
		return this._interpolation_pubID;
	}
}

export class RealtimeSpecificRenderConfig extends SpecificRenderConfig {
	private _antialiasing = new RealtimeAntialiasingRenderConfig();
	public get rendererName(): string {
		return RealtimeRenderer.rendererKey;
	}
	public get antialiasing() {
		return this._antialiasing;
	}
}
