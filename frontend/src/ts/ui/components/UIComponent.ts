import WASMX, { VcBindable } from "../../WASMX";

export default abstract class UIVariableComponent extends HTMLElement implements VcBindable {
	wasmx!: WASMX;
	wasmPath!: string[];

	public unbind() {
		if (this.wasmPath === undefined) return false;
		this.wasmx.vcUnbind(this);
		this.wasmPath = undefined as any as string[];
	}

	public bind(stateVariableURL: string): boolean {
		if (this.wasmPath !== undefined) this.unbind();
		this.wasmPath = stateVariableURL.split(".");
		this.wasmx.vcBind(this);
		return true;
	}

	protected setModelValue(wasmValue: string): void {
		this.wasmx.getModelReference(this.wasmPath).setValue(wasmValue);
	}

	/**
	 * The callback that is called if the underlying model changes and the component is bound to it.
	 * @param value The new value of the model to component is bound to.
	 * @note This shouls usually only be called by the model.
	 */
	public abstract setUiValue(value: string): void;
}
