import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";

export class Kayo {
	private _gpux: GPUX;
	private _project: Project;
	private _wasmx: WASMX;
	private _windows: Set<Window>;

	constructor(gpux: GPUX, wasmx: WASMX) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._project = new Project(this);
		this._windows = new Set();
	}

	get project(): Project {
		return this._project;
	}

	get gpux(): GPUX {
		return this._gpux;
	}

	get wasmx(): WASMX {
		return this._wasmx;
	}

	get windows(): Set<Window> {
		return this._windows;
	}

	public openNewWindow(): void {
		open(window.location.href + "subwindow/", "_blank", "popup=true");
	}

	public registerWindow(win: Window, defaultPane: string) {
		if (this._windows.has(win)) return;

		this._windows.add(win);
		this._project.requestUI(win, defaultPane);
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
