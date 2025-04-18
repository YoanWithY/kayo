import { GPUX } from "./GPUX";
import { Project } from "./project/Project";

export class PageContext {
	private _gpux: GPUX;
	private _project: Project;
	constructor(gpux: GPUX) {
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
}
