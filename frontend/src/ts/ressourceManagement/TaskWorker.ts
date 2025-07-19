/// <reference lib="webworker" />

async function startWorker() {
	const root = await navigator.storage.getDirectory();

	const taskMap: Record<string, (args: any) => Promise<number> | number> = {
		writeFile: async ({
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
			const dirs = path.split("/").filter(Boolean);

			let dir = root;
			for (const segment of dirs) {
				dir = await dir.getDirectoryHandle(segment, { create: true });
			}

			const fileHandle = await dir.getFileHandle(fileName, { create: true });
			const syncHandle = await fileHandle.createSyncAccessHandle();

			try {
				const view = new Uint8Array(buffer, offset, byteLength);
				syncHandle.write(view);
				syncHandle.flush();
			} catch (_: any) {
				return -1;
			} finally {
				syncHandle.close();
			}
			return 0;
		},
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
}

startWorker();
