function randomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export class FileRessourceManager {
	private _systemRoot: FileSystemDirectoryHandle;
	private _projectRoot: FileSystemDirectoryHandle;
	private _projectRootName: string;

	private constructor(
		systemRoot: FileSystemDirectoryHandle,
		projectRoot: FileSystemDirectoryHandle,
		projectRootName: string,
	) {
		this._systemRoot = systemRoot;
		this._projectRoot = projectRoot;
		this._projectRootName = projectRootName;
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

	private static initialied = false;
	public static async requestFileRessourceManager(): Promise<string | FileRessourceManager> {
		if (this.initialied) return "File ressource manager is already initialized!";

		let systemRoot;
		try {
			systemRoot = await navigator.storage.getDirectory();
		} catch (_) {
			return "Could not get root dir!";
		}

		for await (const e of systemRoot.entries()) {
			try {
				await systemRoot.removeEntry(e[0], { recursive: true });
			} catch (_) {
				return `Could not remove entry ${e}!`;
			}
		}
		const rootName = randomString(16);
		const projectRoot = await systemRoot.getDirectoryHandle(rootName, { create: true });

		const manager = new FileRessourceManager(systemRoot, projectRoot, rootName);
		await projectRoot.getDirectoryHandle("raw", { create: true });

		this.initialied = true;
		return manager;
	}
}
