import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";
import { VirtualTextureSystem } from "./Textures/VirtualTextureSystem";
import { ConcurrentTaskQueue } from "./ressourceManagement/ConcurrentTaskQueue";

export class Kayo {
	private _gpux: GPUX;
	private _wasmx: WASMX;
	private _audioContext: AudioContext;
	private _virtualTextureSystem: VirtualTextureSystem; // todo move to wasm
	private _windows: Set<Window>;
	private _project!: Project;

	public constructor(gpux: GPUX, wasmx: WASMX) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._audioContext = new AudioContext({ latencyHint: "interactive" });
		this._virtualTextureSystem = new VirtualTextureSystem(this);
		this._windows = new Set();
	}

	public get gpux(): GPUX {
		return this._gpux;
	}

	public get wasmx(): WASMX {
		return this._wasmx;
	}

	public get taskQueue(): ConcurrentTaskQueue {
		return this.project.taskQueue;
	}

	public get renderers() {
		return this.project.renderers;
	}

	public get audioContext(): AudioContext {
		return this._audioContext;
	}

	public get virtualTextureSystem(): VirtualTextureSystem {
		return this._virtualTextureSystem;
	}

	public get project(): Project {
		return this._project;
	}

	public get windows(): Set<Window> {
		return this._windows;
	}

	public openProject(project: Project, onFinishCallback?: () => void) {
		const installProject = () => {
			window.document.title = `Kayo Engine - ${project.name}`;
			this._project = project;
			project.open(onFinishCallback);
		};
		if (this.project) {
			this.project.close(installProject);
		} else {
			installProject();
		}
	}

	public openNewWindow(): void {
		open("/subwindow/", "_blank", "popup=true");
	}

	public registerWindow(win: Window, defaultPane: string, useHeader: boolean) {
		if (this._windows.has(win)) return;

		this._windows.add(win);
		this._project.requestUI(win, defaultPane, useHeader);
	}

	public closeAllSecondaryWindows(window: Window) {
		for (const win of this._windows) {
			if (win === window) continue;
			win.close();
		}
		this._windows.clear();
		this._windows.add(window);
	}
}
