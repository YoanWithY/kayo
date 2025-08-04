import { ConcurrentTaskQueue } from "../ConcurrentTaskQueue";
import { JsTask } from "../Task";

export type DeleteFSEntryFinishedCallback = (succsses: true | undefined) => void;

export class DeleteFSEntryTask extends JsTask {
	private _path: string;
	private _entry: string;
	private _taskID!: number;
	private _finishedCallback?: DeleteFSEntryFinishedCallback;

	public constructor(path: string, entry: string, finishedCallback?: DeleteFSEntryFinishedCallback) {
		super();
		this._path = path;
		this._entry = entry;
		this._finishedCallback = finishedCallback;
	}

	public run(taskQueue: ConcurrentTaskQueue, taskID: number, workerID: number): void {
		this._taskID = taskID;
		taskQueue.remoteJSCall(workerID, taskID, "deleteFSEntry", { path: this._path, entry: this._entry }, []);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(success: true | undefined) {
		if (this._finishedCallback) this._finishedCallback(success);
	}
}
