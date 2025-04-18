import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import Background from "../lights/Background";
import { SunLight } from "../lights/SunLight";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";

export default class Scene {
	heightFieldObjects = new Set<HeightFieldR3>();
	minecraftWorld?: MinecraftWorld;
	sunlights = new Set<SunLight>();
	gridPipeline?: GridPipeline;
	background!: Background;
}
