/**
 * The basis of the representation. Something like the realtime renderer or the intergral renderer or a colision model.
 */
export interface RepresentationConcept {
	get representationConeceptID(): string;
}

export abstract class Representable {
	protected _representations: Map<string, Representation<RepresentationConcept, this>>;
	public constructor() {
		this._representations = new Map();
	}
	public getRepresentation<T extends RepresentationConcept>(
		representationConcept: T,
	): Representation<RepresentationConcept, this> | undefined {
		return this._representations.get(representationConcept.representationConeceptID);
	}
	public setRepresentation(representation: Representation<RepresentationConcept, this>) {
		this._representations.set(representation.representationConcept.representationConeceptID, representation);
	}
}

export abstract class Representation<T extends RepresentationConcept, K extends Representable> {
	/**
	 * The concept the representation is is for. E.g. reltime renderer.
	 */
	protected _representationConcept: T;
	protected _representationSubject: K;

	public constructor(representationConcept: T, representationSubject: K) {
		this._representationConcept = representationConcept;
		this._representationSubject = representationSubject;
	}

	public get representationConcept() {
		return this._representationConcept;
	}

	public get represenationSubject() {
		return this._representationSubject;
	}
}
