/// <reference lib="webworker" />

let systemRoot!: FileSystemDirectoryHandle;
let projectDir!: FileSystemDirectoryHandle;
let svtFile!: FileSystemFileHandle;
let svtHandle!: FileSystemSyncAccessHandle;

function svtTileKey(textureID: string, mip: number, tileX: number, tileY: number): string {
	return `${mip}-${tileX},${tileY}-${textureID}`;
}

async function initWorker({ projectRootName }: { projectRootName: string }) {
	systemRoot = await navigator.storage.getDirectory();
	projectDir = await systemRoot.getDirectoryHandle(projectRootName, { create: true });
	svtFile = await projectDir.getFileHandle("svt_cache", { create: true });
	svtHandle = await svtFile.createSyncAccessHandle();
	return `Initialized SVT Worker for dir ${projectRootName}`;
}

const svtByteMap: { [key: string]: { byteOffset: number; byteSize: number } } = {};
let currentOffset = 0;
function writeTile({
	textureID,
	level,
	tileX,
	tileY,
	data,
}: {
	textureID: string;
	level: number;
	tileX: number;
	tileY: number;
	data: Uint8Array<SharedArrayBuffer>;
}) {
	const tileKey = svtTileKey(textureID, level, tileX, tileY);
	svtByteMap[tileKey] = { byteOffset: currentOffset, byteSize: data.byteLength };
	svtHandle.write(data, { at: currentOffset });
	svtHandle.flush();
	currentOffset += data.byteLength;
	return 0;
}

self.onmessage = async (event: MessageEvent) => {
	const { func, taskID, args } = event.data;
	switch (func) {
		case "initWorker": {
			self.postMessage({ taskID, returnValue: await initWorker(args) });
			break;
		}
		case "writeTile": {
			self.postMessage({ taskID, returnValue: writeTile(args) });
			break;
		}
		case "readTile": {
			// self.postMessage({ taskID, returnValue: await initWorker(args) });
			break;
		}
		default: {
			console.error(`The provided function name "${func}" is unknown.`);
			self.postMessage({ taskID, returnValue: undefined });
		}
	}
};
