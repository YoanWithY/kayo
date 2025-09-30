/* eslint-disable local/no-await */
/// <reference lib="webworker" />
type ReturnValueType = { returnValue: any; transfer: Transferable[] };
let systemRoot!: FileSystemDirectoryHandle;
let workerID!: number;

const getDirHandleFromPath = async (path: string) => {
	const dirs = path.split("/").filter(Boolean);
	let dir = systemRoot;
	for (const segment of dirs) {
		dir = await dir.getDirectoryHandle(segment, { create: true });
	}
	return dir;
};

const getFileHandleFromPathAndName = async (path: string, fileName: string) => {
	return await (await getDirHandleFromPath(path)).getFileHandle(fileName, { create: true });
};

const initWorkerFunction = async (args: { workerID: number }) => {
	workerID = args.workerID;
	systemRoot = await navigator.storage.getDirectory();
	return { returnValue: `Initialized Worker ${workerID}}`, transfer: [] };
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
		return { returnValue: undefined, transfer: [] };
	} finally {
		syncHandle.close();
	}
	return { returnValue: true, transfer: [] };
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

async function populateChildren(obj: any, dir: FileSystemDirectoryHandle, currentDepth: number, maxDepth: number) {
	const childArray: any[] = [];
	obj.children = childArray;

	if (maxDepth >= 0 && currentDepth > maxDepth) return;

	for await (const fd of dir.values()) {
		const newEntry = { kind: fd.kind, name: fd.name };
		if (fd.kind !== "file")
			await populateChildren(newEntry, fd as FileSystemDirectoryHandle, currentDepth + 1, maxDepth);
		childArray.push(newEntry);
	}
}

const queryFileSystemFunction = async ({ path, maxDepth }: { path: string; maxDepth: number }) => {
	const dir = await getDirHandleFromPath(path);
	const retObj = { type: "directory", name: "ROOT" };
	await populateChildren(retObj, dir, 0, maxDepth);
	return { returnValue: retObj, transfer: [] };
};

const deleteFSEntryTaskFunction = async ({ path, entry }: { path: string; entry: string }) => {
	const dir = await getDirHandleFromPath(path);
	await dir.removeEntry(entry, { recursive: true });
	return { returnValue: undefined, transfer: [] };
};

const taskMap: Record<string, (args: any) => Promise<ReturnValueType> | ReturnValueType> = {
	initWorker: initWorkerFunction,
	storeFile: storeFileFunction,
	loadFile: loadFileFunction,
	queryFileSystem: queryFileSystemFunction,
	deleteFSEntry: deleteFSEntryTaskFunction,
};

self.onmessage = async (event: MessageEvent) => {
	const { func, taskID, args } = event.data;
	const fn = taskMap[func];
	if (typeof fn === "function") {
		const { returnValue, transfer } = await fn(args);
		self.postMessage({ taskID, returnValue }, transfer);
	} else {
		console.error(`The provided function name "${func}" is unknown.`);
		self.postMessage({ taskID, undefined });
	}
};
