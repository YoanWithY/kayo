import { WasmTask, JsTask } from "./Task";

export type ConcurrentTask = WasmTask | { jsTask: JsTask; workerID: number };

type WorkerEntry = { worker: Worker; queue: JsTask[]; isRunning: boolean };

export class ConcurrentTaskQueue {
	private _numWasmThreads: number;
	private _numJsThreads: number;
	private _numRunningWasmThreads: number;
	private _taskID: number;
	private _taskMap: { [key: number]: ConcurrentTask };
	private _wasmTaskQueue: WasmTask[];
	private _jsWorkers: WorkerEntry[];

	public constructor() {
		this._numWasmThreads = navigator.hardwareConcurrency;
		this._numJsThreads = navigator.hardwareConcurrency;
		this._taskID = 0;
		this._numRunningWasmThreads = 0;
		this._taskMap = {};
		this._wasmTaskQueue = [];
		this._jsWorkers = new Array(this._numJsThreads);
	}

	public async initWorkers(projectName: string) {
		const promices: Promise<void>[] = [];
		for (let i = 0; i < this._numJsThreads; i++) {
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
				queue: [],
				isRunning: false,
			};

			this.remoteJSCall(worker, -1, "initWorker", { projectName, workerID: i }, []);
		}

		await Promise.all(promices);
	}

	private _pushJSTask(jsTask: JsTask): number {
		let index =
			jsTask.requiredWorkerID === undefined
				? this._jsWorkers.findIndex((v) => !v.isRunning)
				: jsTask.requiredWorkerID;
		if (index === -1) {
			index = 0;
			for (let i = 0; i < this._jsWorkers.length; i++) {
				if (this._jsWorkers[i].queue.length < this._jsWorkers[index].queue.length) index = i;
			}
		}
		this._jsWorkers[index].queue.push(jsTask);
		return index;
	}

	private _conditonallyPopNextJsTask(workerID: number) {
		const workerEntry = this._jsWorkers[workerID];
		if (workerEntry.isRunning) return;
		const task = workerEntry.queue.shift();
		if (!task) return;
		const id = this._taskID++;
		this._taskMap[id] = { jsTask: task, workerID };
		workerEntry.isRunning = true;
		task.run(id, workerEntry.worker);
	}

	private _conditonallyPopNextWasmTask() {
		if (this._numRunningWasmThreads >= this._numWasmThreads) return;
		const task = this._wasmTaskQueue.shift();
		if (!task) return;
		const id = this._taskID++;
		this._taskMap[id] = task;
		this._numRunningWasmThreads++;
		task.run(id);
	}

	public remoteJSCall(worker: Worker, taskID: number, func: string, args: any, transfer: Transferable[]) {
		worker.postMessage({ func, taskID, args }, transfer);
	}

	public queueWasmTask(wasmTask: WasmTask) {
		this._wasmTaskQueue.push(wasmTask);
		this._conditonallyPopNextWasmTask();
	}

	public queueJsTask(jsTask: JsTask) {
		const workerID = this._pushJSTask(jsTask);
		this._conditonallyPopNextJsTask(workerID);
	}

	public taskUpdate(id: number, progress: number, maximum: number) {
		const taskEntry = this._taskMap[id];
		if (!taskEntry) {
			console.log(`Task with id ${id} is not in the task map.`);
			return;
		}
		const task = taskEntry instanceof WasmTask ? taskEntry : taskEntry.jsTask;
		task.progressCallback(progress, maximum);
	}

	public taskFinished(taskID: number, returnValue: any) {
		const taskEntry = this._taskMap[taskID];
		if (!taskEntry) {
			console.log(`Task with id ${taskID} is not in the task map.`);
			return;
		}
		delete this._taskMap[taskID];
		if (taskEntry instanceof WasmTask) {
			taskEntry.finishedCallback(returnValue);
			this._numRunningWasmThreads--;
			this._conditonallyPopNextWasmTask();
		} else {
			const task = taskEntry.jsTask;
			task.finishedCallback(returnValue);
			this._conditonallyPopNextJsTask(taskEntry.workerID);
		}
	}
}
