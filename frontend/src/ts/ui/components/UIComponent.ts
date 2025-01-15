import StateVariable from "../../project/StateVariable";

export default abstract class UIVariableComponent<T> extends HTMLElement {
	stateVariable!: StateVariable<T>;

	abstract setValue(value: T): void;

	bind(stateVariable: StateVariable<T>) {
		if (this.stateVariable !== undefined)
			return false;
		this.stateVariable = stateVariable;
		stateVariable.bind(this);
	}
}