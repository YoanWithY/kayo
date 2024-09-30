import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import { SunLight } from "../lights/SunLight";
import { Section } from "../minecraft/Section";

export default class Scene {
    heightFieldObjects = new Set<HeightFieldR3>;
    minecraftSections = new Set<Section>
    sunlights = new Set<SunLight>;
    gridPipeline?: GridPipeline;
}