import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { Project } from "./project/Project";

initGPU();
initUIClasses();
new Project();