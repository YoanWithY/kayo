import { Representable } from "../project/Representation";

export class Material extends Representable {
	private _name: string;
	public constructor(name: string) {
		super();
		this._name = name;
	}
	public get name() {
		return this._name;
	}
}
