import { gl } from "./rendering/glInit";
import renderloop from "./rendering/mainRenderer";
import { rootSplitPaneContainer } from "./ui/ui";

console.log(gl);
document.body.appendChild(rootSplitPaneContainer);
requestAnimationFrame(renderloop);