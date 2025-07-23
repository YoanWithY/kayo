import { WasmTask, JsTask } from "./Task";

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
	}

	public async initWorkers(projectName: string) {
		const promices: Promise<void>[] = [];
		for (let i = 0; i < this._numThreads; i++) {
			let externalResolve: (value: void | PromiseLike<void>) => void;
			const promice = new Promise<void>((res) => {
				externalResolve = res;
			});
			promices.push(promice);

			const worker = new Worker(new URL("./TaskWorker.ts", import.meta.url), {
				name: `TaskWorker-${i + 1}`,
				type: "module",
			});

			const workerMessageCallback = (e: MessageEvent) => {
				const taskID = e.data.taskID;
				if (taskID === -1) {
					externalResolve();
					return;
				}
				const progress = e.data.progess as number | undefined;
				if (progress !== undefined) {
					const max = e.data.max as number;
					console.log(`Progress (${taskID}) ${progress} / ${max}`);
				} else {
					this._jsWorkers[i].isRunning = false;
					this.taskFinished(taskID, e.data.returnValue);
				}
			};

			worker.addEventListener("message", workerMessageCallback);
			this._jsWorkers[i] = {
				worker: worker,
				isRunning: false,
			};

			this.remoteJSCall(i, -1, "initWorker", { projectName, workerID: i }, []);
		}

		await Promise.all(promices);
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
		const taskEntry = this._taskMap[taskID];
		if (!taskEntry) {
			console.log(`Task with id ${taskID} is not in the task map.`);
			return;
		}
		delete this._taskMap[taskID];
		taskEntry.finishedCallback(returnValue);
		this._numRunningThreads--;
		this._conditonallyPopNextTask();
	}
}
