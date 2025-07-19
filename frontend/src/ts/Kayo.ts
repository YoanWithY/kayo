import { FileRessourceManager } from "./ressourceManagement/FileRessourceManager";
import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";

export class Kayo {
	private _gpux: GPUX;
	private _project: Project;
	private _wasmx: WASMX;
	private _audioContext: AudioContext;
	private _windows: Set<Window>;
	private _fileRessourceManager: FileRessourceManager;

	public constructor(gpux: GPUX, wasmx: WASMX, fileRessourceManager: FileRessourceManager) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._project = new Project(this);
		this._windows = new Set();
		this._audioContext = new AudioContext({ latencyHint: "interactive" });
		this._fileRessourceManager = fileRessourceManager;
	}

	public get project(): Project {
		return this._project;
	}

	public get gpux(): GPUX {
		return this._gpux;
	}

	public get wasmx(): WASMX {
		return this._wasmx;
	}

	public get windows(): Set<Window> {
		return this._windows;
	}

	public get audioContext(): AudioContext {
		return this._audioContext;
	}

	public get fileRessourceManager(): FileRessourceManager {
		return this._fileRessourceManager;
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
