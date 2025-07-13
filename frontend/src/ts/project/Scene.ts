import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import Background from "../lights/Background";
import { SunLight } from "../lights/SunLight";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";

export default class Scene {
	public heightFieldObjects = new Set<HeightFieldR3>();
	public minecraftWorld?: MinecraftWorld;
	public sunlights = new Set<SunLight>();
	public gridPipeline?: GridPipeline;
	public background!: Background;
}
