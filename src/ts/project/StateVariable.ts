import { Project } from "./Project";

export type StateVariableChangeCallback<T> = (value: T) => void;
export type StateChangeExecutionMode = "immediate" | "deferred";

/**
 * A `StateVaribale` is a meant to be used like a regular variable but inplements observer functionality for UI and rendering.
 */
export default class StateVariable<T> {
	private _value: T;
	private _immediateObserverFunctions: Set<StateVariableChangeCallback<T>> = new Set();
	private _deferredObserverFunctions: Set<StateVariableChangeCallback<T>> = new Set();
	project: Project;
	constructor(project: Project, value: T) {
		this.project = project;
		this._value = value;
	}

	get value() {
		return this._value;
	}

	set value(value: T) {
		this._value = value;
		this.fireChangeEvents();
	}

	/**
	 * Add a callback function to execute when this value changes.
	 * Mutation inside the value will not automatically fire the events.
	 * Use ``this.fireChangeEvents()`` in such a case.
	 * @param callback The callback function to call when the value changes.
	 * @param mode If ``immediate``, the callback will be executed immediately after the value changed.
	 * If ``deferred``, the execution will be deferred to right befor the next rendering cycles.
	 * @returns Returns whether or not the provided callback was added (because of set semantics).
	 * 
	 */
	public addChangeListener(callback: StateVariableChangeCallback<T>, mode: StateChangeExecutionMode): boolean {
		if (mode === "immediate") {
			if (this._immediateObserverFunctions.has(callback))
				return false;
			this._immediateObserverFunctions.add(callback);
		} else {
			if (this._deferredObserverFunctions.has(callback))
				return false;
			this._deferredObserverFunctions.add(callback);
		}
		return true;
	}

	public removeChangeListener(callback: StateVariableChangeCallback<T>, mode: StateChangeExecutionMode) {
		if (mode === "immediate") {
			return this._immediateObserverFunctions.delete(callback);
		} else {
			return this._deferredObserverFunctions.delete(callback);
		}
	}

	public fireChangeEvents() {
		for (const f of this._immediateObserverFunctions)
			f(this._value);
		for (const f of this._deferredObserverFunctions)
			this.project.renderer.preRenderFunctions.add({ val: this.value, f });
	}
}