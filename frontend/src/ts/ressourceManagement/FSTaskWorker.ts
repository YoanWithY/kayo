/* eslint-disable local/no-await */
/// <reference lib="webworker" />
type ReturnValueType = { returnValue: any; transfer: Transferable[] };
let systemRoot!: FileSystemDirectoryHandle;
let projectRoot!: FileSystemDirectoryHandle;
let projectFile!: FileSystemFileHandle;
let projectFileSync!: FileSystemSyncAccessHandle;

const getDirHandleFromPath = async (path: string) => {
	let dirs = path.split("/").filter(Boolean);
	let dir = systemRoot;
	if (dirs.length === 0) return dir;

	if (dirs[0] == ".") {
		dir = projectRoot;
		dirs = dirs.slice(1);
	}

	for (const segment of dirs) {
		dir = await dir.getDirectoryHandle(segment, { create: true });
	}
	return dir;
};

const getFileHandleFromPathAndName = async (path: string, fileName: string) => {
	return await (await getDirHandleFromPath(path)).getFileHandle(fileName, { create: true });
};

const initWorkerFunction = async (args: { projectRootName: string }) => {
	try {
		systemRoot = await navigator.storage.getDirectory();
		projectRoot = await systemRoot.getDirectoryHandle(args.projectRootName, { create: true });
		await projectRoot.getDirectoryHandle("cache", { create: true });
		projectFile = await projectRoot.getFileHandle("project.json", { create: true });
		projectFileSync = await projectFile.createSyncAccessHandle();
		projectFileSync.write(
			new TextEncoder().encode(JSON.stringify({ created: new Date().toISOString() }, undefined, "\t")),
			{
				at: 0,
			},
		);
		projectFileSync.flush();
	} catch (e) {
		console.error(e);
		return { returnValue: undefined, transfer: [] };
	}
	return { returnValue: `Initialized File system worker`, transfer: [] };
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

	if (await fileHandle.isSameEntry(projectFile)) {
		projectFileSync.write(data, { at: 0 });
		projectFileSync.flush();
		return { returnValue: true, transfer: [] };
	}

	const syncHandle = await fileHandle.createSyncAccessHandle();

	try {
		syncHandle.write(data, { at: 0 });
		syncHandle.flush();
	} catch (e) {
		console.error(e);
		return { returnValue: undefined, transfer: [] };
	} finally {
		syncHandle.close();
	}
	return { returnValue: true, transfer: [] };
};

const checkSyncLockFunction = async ({ path, fileName }: { path: string; fileName: string }) => {
	try {
		const fileHandle = await getFileHandleFromPathAndName(path, fileName);
		try {
			const syncHandle = await fileHandle.createSyncAccessHandle();
			syncHandle.close();
		} catch (_) {
			return { returnValue: true, transfer: [] };
		}
	} catch (e) {
		console.error(e);
		return { returnValue: undefined, transfer: [] };
	}
	return { returnValue: false, transfer: [] };
};

const loadFileFunction = async ({ path, fileName }: { path: string; fileName: string }) => {
	const fileHandle = await getFileHandleFromPathAndName(path, fileName);

	if (await fileHandle.isSameEntry(projectFile)) {
		const data = new Uint8Array(projectFileSync.getSize());
		projectFileSync.read(data, { at: 0 });
		return { returnValue: data, transfer: [data.buffer] };
	}

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
	checkSyncLock: checkSyncLockFunction,
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
