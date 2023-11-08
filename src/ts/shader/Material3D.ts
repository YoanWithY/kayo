import { extTFA, gl } from "../rendering/glInit";

const noTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, noTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
gl.bindTexture(gl.TEXTURE_2D, null);

export default class Material3D {
    static global_textures = new Map();
    textures = [noTexture];

    bindTextures() {
        for (let i = 0; i < this.textures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i])
        }
    }

    setTexture(index: number, url: string) {

        if (Material3D.global_textures.has(url)) {
            this.textures[index] = Material3D.global_textures.get(url);
            return;
        }

        const image = new Image();
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        gl.bindTexture(gl.TEXTURE_2D, null);

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameterf(gl.TEXTURE_2D, extTFA.TEXTURE_MAX_ANISOTROPY_EXT, gl.getParameter(extTFA.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
            this.textures[index] = texture;
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        image.crossOrigin = "anonymous";
        image.src = url;
    }
}