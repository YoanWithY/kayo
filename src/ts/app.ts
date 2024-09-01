import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { Project } from "./project/Project";
import HeightFieldR3 from "./dynamicObject/HeightFieldR3";

initGPU();
initUIClasses();
const p = new Project();
p.open();
p.scene.heightFieldObjects.add(new HeightFieldR3());