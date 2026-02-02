import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { Kayo } from "../Kayo";
import { Renderer } from "../Renderer";
import { PTPX as PTPX } from "../collaborative/PTPX";
import { Viewport } from "../rendering/Viewport";
import { SceneRealtimeRepresentation } from "../rendering/SceneRealtimeRepresentation";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { Grid } from "../debug/Grid";
import { AnimationRenderer } from "../ui/panes/animation/AnimationRenderer";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { KayoWasmAddress, StatePath } from "../WASMX";
import { PubID } from "../PubSub";
import { RenderConfig } from "../rendering/config/RenderConfig";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import { PerformanceRenderer } from "../ui/panes/debug/performance/PerformanceRenderer";
import { SVTDebugRenderer } from "../ui/panes/debug/svtDebug/SVTDebugRenderer";
import { Material } from "../mesh/Material";

export class Project {
	private _displayName: string;
	private _fsRootName: string;
	private _renderers = new Map<string, Renderer>();
	private _renderConfigs = new Map<string, RenderConfig>();
	private _virtualTextureSystem: VirtualTextureSystem;
	private _kayo: Kayo;
	private _ptpx!: PTPX;
	public scene!: Scene;

	public constructor(kayo: Kayo, fsRootName: string) {
		this._displayName = "Unnamed Project";
		this._fsRootName = fsRootName;
		this._kayo = kayo;
		this.scene = new Scene();
		this._virtualTextureSystem = new VirtualTextureSystem(kayo);
	}

	public get displayName() {
		return this._displayName;
	}
	public get fsRootName() {
		return this._fsRootName;
	}
	public get renderers() {
		return this._renderers;
	}
	public get virtualTextureSystem() {
		return this._virtualTextureSystem;
	}
	public get renderConfigs() {
		return this._renderConfigs;
	}
	public get ptpx() {
		return this._ptpx;
	}
	public initPTP(ptpx: PTPX) {
		this._ptpx = ptpx;
	}

	public open(onFinishCallback?: () => void) {
		const onInitCallback = () => {
			this._renderConfigs.set(
				"realtime default",
				new RenderConfig("realtime default", new RealtimeSpecificRenderConfig()),
			);
			const realtimeRenderer = new RealtimeRenderer(
				this._kayo,
				this._renderConfigs.get("realtime default") as RenderConfig,
			);
			const animationRenderer = new AnimationRenderer(this._kayo);
			const performanceRenderer = new PerformanceRenderer(this._kayo);
			SVTDebugRenderer.init(this._kayo.gpux, this.virtualTextureSystem);
			const svtDebugRenderer = new SVTDebugRenderer(this._kayo);
			this._renderers.set("realtime default", realtimeRenderer);
			this._renderers.set(AnimationRenderer.rendererKey, animationRenderer);
			this._renderers.set(PerformanceRenderer.rendererKey, performanceRenderer);
			this._renderers.set(SVTDebugRenderer.rendererKey, svtDebugRenderer);
			this.scene.setRepresentation(
				new SceneRealtimeRepresentation(
					this._kayo,
					this.renderers.get("realtime default") as RealtimeRenderer,
					this.scene,
				),
			);
			this.scene.addGrid(new Grid());
			this.scene.addMaterial(new Material("default"));

			if (onFinishCallback) onFinishCallback();
		};
		const onErrorCallback = () => {
			alert("Could not open Project for some reason! You may retry?");
		};
		this._kayo.taskQueue.initProject(this._fsRootName, onInitCallback, onErrorCallback)
	}

	public close(onFinishCallback?: () => void) {
		// TODO: clean up renderes and workers and other ressources.;
		if (onFinishCallback) onFinishCallback();
	}

	public requestUI(win: Window, defaultPane: string, useHeader: boolean) {
		win.document.body.appendChild(WrappingPane.createWrappingPane(win, this._kayo, defaultPane, useHeader));
	}

	private requestedAnimationFrameForWindow: Map<Window, boolean> = new Map<Window, boolean>();
	private viewportsToUpdate = new Set<Viewport>();
	public requestAnimationFrameWith(viewport: Viewport) {
		this.viewportsToUpdate.add(viewport);

		if (this.requestedAnimationFrameForWindow.get(viewport.window)) return;
		this.requestedAnimationFrameForWindow.set(viewport.window, true);

		const windowAnimationFrame = (ts: number) => {
			for (const v of this.viewportsToUpdate) {
				if (v.window != viewport.window) continue;
				const renderer = this._kayo.renderers.get(v.rendererKey);
				if (!renderer) {
					console.error(`Renderer with key "${v.rendererKey}" is not know to kayo.`);
					continue;
				}
				if (!renderer.registeredViewports.has(v)) {
					console.error(`Viewport "${v}" is not registered on renderer ${renderer}`);
					continue;
				}
				renderer.renderViewport(ts, v);
				this.viewportsToUpdate.delete(v);
			}

			this.requestedAnimationFrameForWindow.set(viewport.window, false);
		};
		viewport.window.requestAnimationFrame(windowAnimationFrame);
	}

	private _viewports = new Set<Viewport>();
	public registerViewport(viewport: Viewport) {
		const renderer = this.renderers.get(viewport.rendererKey);
		if (!renderer) {
			console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
			return;
		}
		this._viewports.add(viewport);
		renderer.registerViewport(viewport);
	}

	public unregisterViewport(viewport: Viewport) {
		const renderer = this.renderers.get(viewport.rendererKey);
		if (!renderer) {
			console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
			return;
		}
		this._viewports.delete(viewport);
		renderer.unregisterViewport(viewport);
	}

	public get viewports() {
		return this._viewports;
	}

	public fullRerender() {
		for (const vp of this._viewports) this.requestAnimationFrameWith(vp);
	}

	public getParentByPath(wasmPath: StatePath) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let obj: any = this;
		const max = wasmPath.length - 1;
		for (let i = 0; i < max; i++) {
			const segment = wasmPath[i];
			if (segment.map) obj = obj.get(segment.val);
			else obj = obj[segment.val];
		}
		return obj;
	}

	public getValueByPath(stateURL: string) {
		const wasmPath = Project._toStateVariablePath(stateURL);
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let obj: any = this;
		for (const segment of wasmPath) {
			if (segment.map) obj = obj.get(segment.val);
			else obj = obj[segment.val];
		}
		return obj;
	}

	public setValueByURL(stateURL: string, value: any) {
		const wasmPath = Project._toStateVariablePath(stateURL);
		const parent = this.getParentByPath(wasmPath);
		parent[(wasmPath.at(-1) as { val: string }).val] = value;
	}

	public getAddressFromPath(statePath: StatePath): KayoWasmAddress {
		const parent = this.getParentByPath(statePath);
		const address = parent[(statePath.at(-1) as { val: string }).val + "_pubID"];
		if (address === undefined) {
			const mapping = (v: { map: boolean; val: string }) => v.val;
			console.error(`Address under "${statePath.map(mapping)}" is unknown`);
		}
		return address;
	}

	private _bindings: Map<string | KayoWasmAddress, Set<(v: any) => void>> = new Map();
	public dispatchValueToSubscribers(pubID: PubID, value: number) {
		const bound = this._bindings.get(pubID);
		if (!bound) return;
		for (const callback of bound) callback(value);
		this.fullRerender();
	}

	public addChangeListener(stateURL: string, f: (v: any) => void, fireImmediately: boolean = false) {
		const statePath = Project._toStateVariablePath(stateURL);
		if (statePath.length <= 0) {
			console.error("Path has lenth 0!");
			return;
		}
		const address = this.getAddressFromPath(statePath);
		let binding = this._bindings.get(address);
		if (!binding) {
			binding = new Set<(v: any) => void>();
			this._bindings.set(address, binding);
		}
		binding.add(f);
		if (fireImmediately) f(this.getValueByPath(stateURL));
	}

	public removeChangeListener(stateURL: string, f: (v: any) => void) {
		const statePath = Project._toStateVariablePath(stateURL);
		if (statePath.length <= 0) {
			console.error("Path has length 0!");
			return;
		}
		const address = this.getAddressFromPath(statePath);
		const binding = this._bindings.get(address);
		if (!binding) return;
		binding.delete(f);
		if (binding.size == 0) this._bindings.delete(address);
	}

	private static _toStateVariablePath(stateURL: string): StatePath {
		const mapping = (s: string) => {
			return { map: s[0] == ":", val: s[0] == ":" || s[0] == "." ? s.substring(1) : s };
		};
		return stateURL.split(/(?=[.:])/).map(mapping);
	}

	public static resolvePathVariables(stateVariableURL: string, varMap?: { [key: string]: string }) {
		if (varMap)
			for (const varName in varMap) stateVariableURL = stateVariableURL.replaceAll(varName, varMap[varName]);
		return stateVariableURL;
	}
}
