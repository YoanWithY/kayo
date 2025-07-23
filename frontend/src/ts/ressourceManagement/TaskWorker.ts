/// <reference lib="webworker" />

let root!: FileSystemDirectoryHandle;
let projectDir!: FileSystemDirectoryHandle;
let id!: number;

const getDirHandleFromPath = async (path: string) => {
	const dirs = path.split("/").filter(Boolean);
	let dir = projectDir;
	for (const segment of dirs) {
		dir = await dir.getDirectoryHandle(segment, { create: true });
	}
	return dir;
};

const getFileHandleFromPath = async (path: string, fileName: string) => {
	return await (await getDirHandleFromPath(path)).getFileHandle(fileName, { create: true });
};

const initWorkerFunction = async ({
	projectName: projectRootName,
	workerID,
}: {
	projectName: string;
	workerID: number;
}) => {
	id = workerID;
	root = await navigator.storage.getDirectory();
	projectDir = await root.getDirectoryHandle(projectRootName);
	return `Initialized Worker ${id} for dir ${projectRootName}`;
};

const writeFileFunction = async ({
	path,
	fileName,
	buffer,
	offset,
	byteLength,
}: {
	path: string;
	fileName: string;
	buffer: ArrayBufferLike;
	offset: number;
	byteLength: number;
}) => {
	const fileHandle = await getFileHandleFromPath(path, fileName);
	const syncHandle = await fileHandle.createSyncAccessHandle();

	try {
		const view = new Uint8Array(buffer, offset, byteLength - byteLength);
		syncHandle.write(view);
		syncHandle.flush();
	} catch (_: any) {
		return -1;
	} finally {
		syncHandle.close();
	}
	return 0;
};

const taskMap: Record<string, (args: any) => Promise<any> | any> = {
	writeFile: writeFileFunction,
	initWorker: initWorkerFunction,
};

self.onmessage = async (event: MessageEvent) => {
	const { func, taskID, args } = event.data;
	const fn = taskMap[func];
	if (typeof fn === "function") {
		self.postMessage({ taskID, returnValue: await fn(args) });
	} else {
		console.error(`The provided function name "${func}" is unknown.`);
	}
};
