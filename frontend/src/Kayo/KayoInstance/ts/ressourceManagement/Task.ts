export abstract class WasmTask {
	public abstract run(taskID: number): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}

export abstract class FSTask {
	public abstract run(taskID: number, fsWorker: Worker): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}
