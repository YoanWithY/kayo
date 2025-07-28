function randomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export class FileRessourceManager {
	private _systemRoot: FileSystemDirectoryHandle;
	private _projectRoot: FileSystemDirectoryHandle;
	private _projectRootName: string;

	private _unserializedProjects: Set<FileSystemDirectoryHandle>;
	private _serializedProjects: Set<FileSystemDirectoryHandle>;

	private constructor(
		systemRoot: FileSystemDirectoryHandle,
		projectRoot: FileSystemDirectoryHandle,
		projectRootName: string,
	) {
		this._systemRoot = systemRoot;
		this._projectRoot = projectRoot;
		this._projectRootName = projectRootName;
		this._unserializedProjects = new Set();
		this._serializedProjects = new Set();
	}

	public get systemRoot() {
		return this._systemRoot;
	}

	public get projectRoot() {
		return this._projectRoot;
	}

	public get projectRootName() {
		return this._projectRootName;
	}

	public get unserializedProjects() {
		return this._unserializedProjects;
	}

	public get serializedProjects() {
		return this._serializedProjects;
	}

	public async deleteUnserializedProjects(projects: FileSystemDirectoryHandle[]) {
		for (const p of projects) {
			if (p.name === this._projectRootName) continue;
			this._unserializedProjects.delete(p);
			await this._systemRoot.removeEntry(p.name, { recursive: true });
		}
	}

	private static initialied = false;
	public static async requestFileRessourceManager(): Promise<string | FileRessourceManager> {
		if (this.initialied) return "File ressource manager is already initialized!";

		let systemRoot;
		try {
			systemRoot = await navigator.storage.getDirectory();
		} catch (_) {
			return "Could not get root dir!";
		}

		const projectRootName = randomString(16);
		const projectRoot = await systemRoot.getDirectoryHandle(projectRootName, { create: true });

		const manager = new FileRessourceManager(systemRoot, projectRoot, projectRootName);
		await projectRoot.getDirectoryHandle("raw", { create: true });

		for await (const e of systemRoot.entries()) {
			if (e[1] instanceof FileSystemFileHandle) continue;

			const handle = e[1] as FileSystemDirectoryHandle;
			try {
				await handle.getFileHandle("project", { create: false });
				manager._serializedProjects.add(handle);
			} catch (_) {
				manager._unserializedProjects.add(handle);
			}
		}

		this.initialied = true;
		return manager;
	}
}

const decoder = new TextDecoder();
export function uint8ArrayToObject(data: Uint8Array): any {
	return JSON.parse(decoder.decode(data));
}
