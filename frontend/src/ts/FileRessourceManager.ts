export class FileRessourceManager {
	private _systemRoot;
	private _projectRoot;
	private _raw!: FileSystemDirectoryHandle;
	private _svt!: FileSystemDirectoryHandle;

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

	public get svt() {
		return this._svt;
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

		const projectRoot = await systemRoot.getDirectoryHandle(`temp`, { create: true });

		const manager = new FileRessourceManager(systemRoot, projectRoot);
		manager._raw = await projectRoot.getDirectoryHandle("raw", { create: true });
		manager._svt = await projectRoot.getDirectoryHandle("sparse_virtual_textures", { create: true });

		this.initialied = true;
		return manager;
	}

	public async storeRaw(file: File) {
		const fs = await this._raw.getFileHandle(file.name, { create: true });
		const ws = await fs.createWritable({});
		await ws.write(file);
		await ws.close();
	}
}
