import { Mesh } from "../../c/KayoCorePP";
import { Representable } from "../project/Representation";

export class MeshObject extends Representable {
	private _mesh: Mesh;

	public constructor(mesh: Mesh) {
		super();
		this._mesh = mesh;
	}

	public get mesh() {
		return this._mesh;
	}
}
