import { Project } from "../project/Project";
import { SVTFSTask } from "./jsTasks/SVTFSTask";
import { WasmTask, FSTask } from "./Task";

export function postFSMessage(worker: Worker, taskID: number, func: string, args: any, transfer: Transferable[]) {
	worker.postMessage({ func, taskID, args }, transfer);
}

export class TaskQueue {
	private _project: Project;
	private _numThreads: number;
	private _numRunningThreads: number;
	private _taskID: number;

	private _wasmTaskMap: { [key: number]: WasmTask };
	private _wasmTaskQueue: WasmTask[];

	private _svtTaskMap: { [key: number]: SVTFSTask };
	private _svtWorker: Worker;

	private _fsTaskMap: { [key: number]: FSTask };
	private _fsWorker: Worker;

	public constructor(project: Project) {
		this._project = project;
		this._taskID = 0;
		this._numThreads = navigator.hardwareConcurrency;
		this._numRunningThreads = 0;

		this._wasmTaskMap = {};
		this._wasmTaskQueue = [];

		this._svtTaskMap = {};
		this._svtWorker = new Worker(new URL("./SVTWorker.ts", import.meta.url), {
			name: `SVT-Worker`,
			type: "module",
		});

		this._fsTaskMap = {};
		this._fsWorker = new Worker(new URL("./FSTaskWorker.ts", import.meta.url), {
			name: `FS-Worker`,
			type: "module",
		});
	}

	public async initWorkers() {
		const promices: Promise<void>[] = [];
		{
			// FS Worker
			let externalResolve: (value: void | PromiseLike<void>) => void;
			const executorCallback = (res: any) => {
				externalResolve = res;
			};
			const promice = new Promise<void>(executorCallback);
			promices.push(promice);

			const fsWorkerMessageCallback = (e: MessageEvent) => {
				const taskID = e.data.taskID;
				const progress = e.data.progess as number | undefined;
				if (progress !== undefined) {
					const max = e.data.max as number;
					console.log(`Progress (${taskID}) ${progress} / ${max}`);
				} else {
					this._fsTaskMap[taskID].finishedCallback(e.data.returnValue);
					this._numRunningThreads--;
					delete this._fsTaskMap[taskID];
					this._conditonallyPopNextWasmTask();
				}
			};

			const fsWorkerInitCallback = (e: MessageEvent) => {
				const taskID = e.data.taskID;
				if (taskID !== -1) return;
				this._fsWorker.removeEventListener("message", fsWorkerInitCallback);
				this._fsWorker.addEventListener("message", fsWorkerMessageCallback);
				externalResolve();
			};

			this._fsWorker.addEventListener("message", fsWorkerInitCallback);
			this.remoteFSCall(-1, "initWorker", { projectRootName: this._project.fsRootName }, []);
		}

		{
			// SVT Worker
			let externalResolve: (value: void | PromiseLike<void>) => void;
			const executorCallback = (res: any) => {
				externalResolve = res;
			};
			const promice = new Promise<void>(executorCallback);
			promices.push(promice);

			const svtWorkerCallback = (e: MessageEvent) => {
				const taskID = e.data.taskID;
				this._svtTaskMap[taskID].finishedCallback(e.data.returnValue);
				this._numRunningThreads--;
				delete this._svtTaskMap[taskID];
				this._conditonallyPopNextWasmTask();
			};
			const svtInitCallback = (e: MessageEvent) => {
				const taskID = e.data.taskID;
				if (taskID !== -1) return;
				this._svtWorker.removeEventListener("message", svtInitCallback);
				this._svtWorker.addEventListener("message", svtWorkerCallback);
				externalResolve();
			};

			this._svtWorker.addEventListener("message", svtInitCallback);
			this._svtWorker.postMessage({
				func: "initWorker",
				taskID: -1,
				args: { projectRootName: this._project.fsRootName },
			});
		}
		// eslint-disable-next-line local/no-await
		await Promise.all(promices);
	}

	private _conditonallyPopNextWasmTask() {
		if (this._numRunningThreads >= this._numThreads) return;
		const wasmTask = this._wasmTaskQueue.shift();
		if (!wasmTask) return;
		const id = this._taskID++;
		this._wasmTaskMap[id] = wasmTask;
		this._numRunningThreads++;
		wasmTask.run(id);
	}

	public remoteFSCall(taskID: number, func: string, args: any, transfer: ArrayBuffer[]) {
		this._fsWorker.postMessage({ func, taskID, args }, transfer);
	}

	public queueWasmTask(task: WasmTask) {
		this._wasmTaskQueue.push(task);
		this._conditonallyPopNextWasmTask();
	}

	public queueSVTTask(svtTask: SVTFSTask) {
		const taskID = this._taskID++;
		this._svtTaskMap[taskID] = svtTask;
		this._numRunningThreads++;
		svtTask.run(taskID, this._svtWorker);
	}

	public queueFSTask(fsTask: FSTask) {
		const taskID = this._taskID++;
		this._fsTaskMap[taskID] = fsTask;
		this._numRunningThreads++;
		fsTask.run(taskID, this._fsWorker);
	}

	public wasmTaskUpdate(id: number, progress: number, maximum: number) {
		const task = this._wasmTaskMap[id];
		if (!task) {
			console.log(`Task with id ${id} is not in the task map.`);
			return;
		}
		task.progressCallback(progress, maximum);
	}

	public wasmTaskFinished(taskID: number, returnValue: any) {
		const taskEntry = this._wasmTaskMap[taskID];
		if (!taskEntry) {
			console.log(`Task with id ${taskID} is not in the wasm task map.`);
			return;
		}
		delete this._wasmTaskMap[taskID];
		taskEntry.finishedCallback(returnValue);
		this._numRunningThreads--;
		this._conditonallyPopNextWasmTask();
	}
}
