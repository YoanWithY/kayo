export class FileRessourceManager {
	private _systemRoot;
	private _projectRoot;

	private constructor(systemRoot: FileSystemDirectoryHandle, projectRoot: FileSystemDirectoryHandle) {
		this._systemRoot = systemRoot;
		this._projectRoot = projectRoot;
	}

	public get systemRoot() {
		return this._systemRoot;
	}

	public get projectRoot() {
		return this._projectRoot;
	}

	private static initialied = false;
	public static async requestFileRessourceManager(): Promise<string | FileRessourceManager> {
		if (this.initialied) return "File ressource manager is already initialized!";

		const systemRoot = await navigator.storage.getDirectory();
		for await (const e of systemRoot.entries()) systemRoot.removeEntry(e[0]);

		const projectRoot = await systemRoot.getDirectoryHandle("temp", { create: true });

		this.initialied = true;
		return new FileRessourceManager(systemRoot, projectRoot);
	}
}
