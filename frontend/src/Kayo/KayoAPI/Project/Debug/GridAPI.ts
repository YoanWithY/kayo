import { Grid } from "../../../KayoInstance/ts/debug/Grid"
import { SceneObjectAPI } from "../SceneObjectAPI";

export class GridAPI implements SceneObjectAPI {
    private _grid: Grid;

    public constructor(grid: Grid) {
        this._grid = grid;
    }

    public get sceneObjectAPIType(): string {
        return this._grid.type;
    }

    public get internal() {
        return this._grid;
    }
}