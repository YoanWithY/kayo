import mat4 from "../math/mat4";
import vec3 from "../math/vec3";
import PerspectiveProjection from "../projection/PerspectiveProjection";
import FrameBuffer from "../rendering/framebuffer";
import TransformationStack from "../transformation/TransformationStack";
import Camera from "./Camera";

/**
 * A Camera that is capabale of being a viewport.
 */
export default class ViewportCamera implements Camera {
    framebuffer = new FrameBuffer();
    projection = new PerspectiveProjection();
    transformationStack = new TransformationStack();

    /**
     * The x coordinate of glViewport
     */
    x = 0;

    /**
     * The y coordinate of glViewport
     */
    y = 0;

    /**
     * The widht coordinate of glViewport
     */
    public get width() {
        return this.framebuffer.width;
    }

    /**
     * The height coordinate of glViewport
     */
    public get height() {
        return this.framebuffer.height;
    }

    getProjectionMatrix(): mat4 {
        return this.projection.getProjectionMatrix(this.width, this.height);
    }
    getViewMatrix(): mat4 {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
    getWorldLocation(): vec3 {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }

}