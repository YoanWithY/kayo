import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";

export default class Scene {
    heightFieldObjects = new Set<HeightFieldR3>;
    gridPipeline?: GridPipeline;
}