import { gpuInit as initGPU } from "./GPUX";
import { initUI as initUIClasses } from "./ui/ui";
import { Project } from "./project/Project";
import { wasmInstance } from "../c/wasmHello";

initGPU();
initUIClasses();
wasmInstance.helloWorld();

new Project();