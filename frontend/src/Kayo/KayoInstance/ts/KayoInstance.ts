import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";
import { VirtualTextureSystem } from "./Textures/VirtualTextureSystem";
import { TaskQueue } from "./ressourceManagement/TaskQueue";
import { DirectoryEntry, QueryFileSystemTask } from "./ressourceManagement/jsTasks/QuereyFileSystemTask";
import { DeleteFSEntryTask } from "./ressourceManagement/jsTasks/DeleteFSEntryTask";
import { CheckSyncLockTask } from "./ressourceManagement/jsTasks/CheckSyncLockTask";

export class KayoInstance {
	private _gpux: GPUX;
	private _wasmx: WASMX;
	private _audioContext: AudioContext;
	private _windows: Set<Window>;
	private _taskQueue: TaskQueue;
	public project!: Project;

	public constructor(gpux: GPUX, wasmx: WASMX) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._audioContext = new AudioContext({ latencyHint: "interactive" });
		this._windows = new Set();
		this._taskQueue = new TaskQueue();
	}

	public get gpux(): GPUX {
		return this._gpux;
	}

	public get wasmx(): WASMX {
		return this._wasmx;
	}

	public get taskQueue(): TaskQueue {
		return this._taskQueue;
	}

	public get audioContext(): AudioContext {
		return this._audioContext;
	}

	public get virtualTextureSystem(): VirtualTextureSystem {
		return this.project.virtualTextureSystem;
	}

	public get windows(): Set<Window> {
		return this._windows;
	}

	public init(onFinished: () => void, onError: () => void) {
		this._taskQueue.initWorkers().then(onFinished, onError);
	}

	public cleanUpFileSystem() {
		const queryFinishedCallback = (root: DirectoryEntry | undefined) => {
			if (!root) return;
			for (const projectRoot of root.children) {
				const lockQueryFinishedCallback = (locked: boolean | undefined) => {
					if (locked === undefined) return;
					if (locked) return;

					this.taskQueue.queueFSTask(new DeleteFSEntryTask("", projectRoot.name));
				};
				this.taskQueue.queueFSTask(
					new CheckSyncLockTask(projectRoot.name, "project.json", lockQueryFinishedCallback),
				);
			}
		};
		this.taskQueue.queueFSTask(new QueryFileSystemTask("", 0, queryFinishedCallback));
	}
}
