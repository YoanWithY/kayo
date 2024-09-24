import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import { SunLight } from "../lights/SunLight";

export default class Scene {
    heightFieldObjects = new Set<HeightFieldR3>;
    sunlights = new Set<SunLight>;
    gridPipeline?: GridPipeline;
}