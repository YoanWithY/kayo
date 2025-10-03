import { postFSMessage } from "../TaskQueue";
import { FSTask } from "../Task";

export type DeleteFSEntryFinishedCallback = (succsses: true | undefined) => void;

export class DeleteFSEntryTask extends FSTask {
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

	public run(taskID: number, worker: Worker): void {
		this._taskID = taskID;
		postFSMessage(worker, taskID, "deleteFSEntry", { path: this._path, entry: this._entry }, []);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(success: true | undefined) {
		if (this._finishedCallback) this._finishedCallback(success);
	}
}
