export type TaskType = "wasm" | "js";

export abstract class WasmTask {
	public get taskType(): TaskType {
		return "wasm";
	}
	public abstract run(taskID: number): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}

export abstract class JsTask {
	public requiredWorkerID?: number;
	public get taskType(): TaskType {
		return "js";
	}
	public abstract run(taskID: number, worker: Worker): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}
