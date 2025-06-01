import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";

export class Kayo {
	private _gpux: GPUX;
	private _project: Project;
	private _wasmx: WASMX;
	constructor(gpux: GPUX, wasmx: WASMX) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._project = new Project(this);
		this._project.requestUI(window);
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

	public openNewWindow(): void {
		open(window.location.href, "_blank", "popup=true");
	}
}
