"use strict"
class Shader {
    program;
    uniformLocations = [];

    constructor(vs, fs) {
        this.program = this.#createProgram(
            this.#createShader(gl.VERTEX_SHADER, getTextFromFile(vs)), this.#createShader(gl.FRAGMENT_SHADER, getTextFromFile(fs)));
        if (!this.program) throw "Could not create shader!";

        for (let i = 2; i < arguments.length; i++) {
            this.uniformLocations.push(gl.getUniformLocation(this.program, arguments[i]));
        }
    }

    loadMat4(loc, mat4) {
        gl.uniformMatrix4fv(this.uniformLocations[loc], true, new Float32Array(mat4));
    }

    #createShader(type, source) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            return shader;

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return undefined;
    }

    #createProgram(vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS))
            return program;

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return undefined;
    }
}

const noTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, noTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
gl.bindTexture(gl.TEXTURE_2D, null);

class material {
    static global_textures = new Map();
    textures = [noTexture];

    bindTextures() {
        for (let i = 0; i < this.textures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i])
        }
    }

    setTexture(index, url) {

        if (material.global_textures.has(url)) {
            this.testures[index] = material.global_textures.get(url);
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
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            this.textures[index] = texture;
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        image.crossOrigin = "anonymous";
        image.src = url;
    }
}