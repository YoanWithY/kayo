export abstract class WasmTask {
	public abstract run(taskID: number): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}

export abstract class JsTask {
	public abstract run(taskID: number, workerID: number): void;
	public abstract progressCallback(progress: number, maximum: number): void;
	public abstract finishedCallback(returnValue: any): void;
}

export type ConcurrentTask = WasmTask | JsTask;

type WorkerEntry = { worker: Worker; isRunning: boolean };

export class ConcurrentTaskQueue {
	private _numThreads: number;
	private _numRunningThreads: number;
	private _taskID: number;
	private _taskMap: { [key: number]: ConcurrentTask };
	private _taskQueue: ConcurrentTask[];
	private _jsWorkers: WorkerEntry[];

	public constructor() {
		this._numThreads = navigator.hardwareConcurrency;
		this._taskID = 0;
		this._numRunningThreads = 0;
		this._taskMap = {};
		this._taskQueue = [];
		this._jsWorkers = new Array(this._numThreads);
		for (let i = 0; i < this._numThreads; i++) {
			const worker = new Worker(new URL("./TaskWorker.ts", import.meta.url), {
				name: `TaskWorker-${i + 1}`,
				type: "module",
			});
			worker.addEventListener("message", (e) => {
				const taskID = e.data.taskID;
				const progress = e.data.progess as number | undefined;
				if (progress !== undefined) {
					const max = e.data.max as number;
					console.log(`Progress (${taskID}) ${progress} / ${max}`);
				} else {
					this._jsWorkers[i].isRunning = false;
					this._conditonallyPopNextTask();
					this.taskFinished(taskID, e.data.returnValue);
				}
			});
			this._jsWorkers[i] = {
				worker: worker,
				isRunning: false,
			};
		}
	}

	private _occupyJSWorker(): number {
		const i = this._jsWorkers.findIndex((v) => !v.isRunning) as number;
		this._jsWorkers[i].isRunning = true;
		return i;
	}

	private _conditonallyPopNextTask() {
		if (this._numRunningThreads >= this._numThreads) return;
		const task = this._taskQueue.shift();
		if (!task) return;
		const id = this._taskID++;
		this._taskMap[id] = task;
		this._numRunningThreads++;
		if (task instanceof WasmTask) task.run(id);
		else task.run(id, this._occupyJSWorker());
	}

	public remoteJSCall(workerID: number, taskID: number, func: string, args: any, transfer: ArrayBuffer[]) {
		this._jsWorkers[workerID].worker.postMessage({ func, taskID, args }, transfer);
	}

	public queueTask(wasmTask: ConcurrentTask) {
		this._taskQueue.push(wasmTask);
		this._conditonallyPopNextTask();
	}

	public taskUpdate(id: number, progress: number, maximum: number) {
		const task = this._taskMap[id];
		if (!task) {
			console.log(`Task with id ${id} is not in the task map.`);
			return;
		}
		task.progressCallback(progress, maximum);
	}

	public taskFinished(taskID: number, returnValue: any) {
		const task = this._taskMap[taskID];
		if (!task) {
			console.log(`Task with id ${taskID} is not in the task map.`);
			return;
		}
		task.finishedCallback(returnValue);

		delete this._taskMap[taskID];
		this._numRunningThreads--;
		this._conditonallyPopNextTask();
	}
}
