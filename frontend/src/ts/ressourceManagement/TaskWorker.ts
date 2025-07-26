/// <reference lib="webworker" />
type ReturnValueType = { returnValue: any; transfer: Transferable[] };
let root!: FileSystemDirectoryHandle;
let id!: number;

const getDirHandleFromPath = async (path: string) => {
	const dirs = path.split("/").filter(Boolean);
	let dir = root;
	for (const segment of dirs) {
		dir = await dir.getDirectoryHandle(segment, { create: true });
	}
	return dir;
};

const getFileHandleFromPathAndName = async (path: string, fileName: string) => {
	return await (await getDirHandleFromPath(path)).getFileHandle(fileName, { create: true });
};

const initWorkerFunction = async ({ workerID }: { workerID: number }) => {
	id = workerID;
	root = await navigator.storage.getDirectory();
	return { returnValue: `Initialized Worker ${id}}`, transfer: [] };
};

const storeFileFunction = async ({
	path,
	fileName,
	data,
}: {
	path: string;
	fileName: string;
	data: Uint8Array<ArrayBufferLike>;
}) => {
	const fileHandle = await getFileHandleFromPathAndName(path, fileName);
	const syncHandle = await fileHandle.createSyncAccessHandle();

	try {
		syncHandle.write(data);
		syncHandle.flush();
	} catch (e) {
		console.error(e);
		return { returnValue: -1, transfer: [] };
	} finally {
		syncHandle.close();
	}
	return { returnValue: 0, transfer: [] };
};

const loadFileFunction = async ({ path, fileName }: { path: string; fileName: string }) => {
	const fileHandle = await getFileHandleFromPathAndName(path, fileName);
	const syncHandle = await fileHandle.createSyncAccessHandle();
	const data = new Uint8Array(syncHandle.getSize());
	try {
		syncHandle.read(data);
	} catch (_) {
		return { returnValue: undefined, transfer: [] };
	} finally {
		syncHandle.close();
	}
	return { returnValue: data, transfer: [data.buffer] };
};

const taskMap: Record<string, (args: any) => Promise<ReturnValueType> | ReturnValueType> = {
	initWorker: initWorkerFunction,
	storeFile: storeFileFunction,
	loadFile: loadFileFunction,
};

self.onmessage = async (event: MessageEvent) => {
	const { func, taskID, args } = event.data;
	const fn = taskMap[func];
	if (typeof fn === "function") {
		const { returnValue, transfer } = await fn(args);
		self.postMessage({ taskID, returnValue }, transfer);
	} else {
		console.error(`The provided function name "${func}" is unknown.`);
	}
};
