import linearRGBToLinearDisplayP3 from "../../wgsl/utility/linearRGBToLinearDisplayP3.wgsl?raw";
import sRGB_EOTF from "../../wgsl/utility/sRGB_EOTF.wgsl?raw";
import sRGB_OETF from "../../wgsl/utility/sRGB_OETF.wgsl?raw";
import fragmentOutput from "../../wgsl/utility/fragmentOutput.wgsl?raw";
import frame from "../../wgsl/utility/frame.wgsl?raw";
import fullScreenQuad from "../../wgsl/utility/fullScreenQuadVertex.wgsl?raw";
import targetColorSpace from "../../wgsl/utility/targetColorSpace.wgsl?raw";
import r3 from "../../wgsl/utility/r3.wgsl?raw";
import mipmapCode from "./mipmap.wgsl?raw";
import { gpuDevice } from "../GPUX";
import { fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractPipeline";

const snippets: { [key: string]: string } = {
	"utility/fragmentOutput": fragmentOutput,
	"utility/linearRGBToLinearDisplayP3": linearRGBToLinearDisplayP3,
	"utility/sRGB_EOTF": sRGB_EOTF,
	"utility/sRGB_OETF": sRGB_OETF,
	"utility/frame": frame,
	"utility/fullScreenQuadVertex": fullScreenQuad,
	"utility/r3": r3,
	"utility/targetColorSpace": targetColorSpace,
};

export function resolveIncludes(code: string): string {
	return code.replace(/#include\s*<([^>]+)>/g, (match, p1) => {
		const includedCode = snippets[p1];
		if (!includedCode) {
			console.error("Could not resolve:", match);
			return match;
		}
		return resolveIncludes(includedCode);
	});
}

export function resolveVariables(code: string, map: { [key: string]: string }): string {
	for (const key in map)
		code = code.replaceAll(`#${key}`, map[key]);
	return code;
}

export function resolveShader(code: string, map: { [key: string]: string } = {}): string {
	return resolveVariables(resolveIncludes(code), map);
}

export async function loadImageTexture(device: GPUDevice, imageUrl: string): Promise<GPUTexture> {
	const response = await fetch(imageUrl);
	const blob = await response.blob();
	const imageBitmap = await createImageBitmap(blob);

	const texture = device.createTexture({
		size: [imageBitmap.width, imageBitmap.height, 1],
		mipLevelCount: Math.log2(Math.max(imageBitmap.width, imageBitmap.height)) + 1,
		format: 'rgba8unorm',
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
	});

	device.queue.copyExternalImageToTexture(
		{ source: imageBitmap, flipY: true },
		{ texture: texture },
		[imageBitmap.width, imageBitmap.height]
	);

	return texture;
}


const mipMapPipelines: { [key: string]: GPURenderPipeline } = {};
const mipMapModule = gpuDevice.createShaderModule(
	{
		label: "mip map shader module",
		code: resolveShader(mipmapCode),
		compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
	}
);
const sampler = gpuDevice.createSampler({ minFilter: "linear" });
export function generateMipMap(texture: GPUTexture) {
	if (!mipMapPipelines[texture.format]) {
		mipMapPipelines[texture.format] = gpuDevice.createRenderPipeline(
			{
				layout: "auto",
				vertex: {
					module: mipMapModule
				},
				fragment: {
					module: mipMapModule,
					targets: [{ format: texture.format }]
				},
				primitive: { topology: "triangle-strip" }
			}
		);
	}

	const pipeline = mipMapPipelines[texture.format];

	const encoder = gpuDevice.createCommandEncoder({ label: 'mip gen encoder' });
	let width = texture.width;
	let height = texture.height;
	let baseMipLevel = 0;
	while (width > 1 || height > 1) {
		width = Math.max(1, width / 2 | 0);
		height = Math.max(1, height / 2 | 0);

		const bindGroup = gpuDevice.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: texture.createView({ baseMipLevel: baseMipLevel, mipLevelCount: 1 }) },
				{ binding: 1, resource: sampler },
			],
		});
		baseMipLevel++

		const renderPassDescriptor: GPURenderPassDescriptor = {
			label: 'mip render pass',
			colorAttachments: [
				{
					view: texture.createView({ baseMipLevel: baseMipLevel, mipLevelCount: 1 }),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [1, 1, 1, 1]
				},
			],
		};

		const pass = encoder.beginRenderPass(renderPassDescriptor);
		pass.setViewport(0, 0, width, height, 0, 1);
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.draw(4);
		pass.end();
	}
	gpuDevice.queue.submit([encoder.finish()]);
}