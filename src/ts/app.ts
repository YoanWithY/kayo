import { loop } from "./rendering/tempRender";
import { rootSplitPaneContainer } from "./ui/ui";
document.body.appendChild(rootSplitPaneContainer);
requestAnimationFrame(loop);