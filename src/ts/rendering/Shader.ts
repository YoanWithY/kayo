import linearRGBToLinearDisplayP3 from "../../wgsl/utility/linearRGBToLinearDisplayP3.wgsl?raw";
import sRGB_gammaExpansion from "../../wgsl/utility/sRGB_gammaExpansion.wgsl?raw";
import sRGB_gammaCompression from "../../wgsl/utility/sRGB_gammaCompression.wgsl?raw";
import fragmentOutput from "../../wgsl/utility/fragmentOutput.wgsl?raw";

const snippets: { [key: string]: string } = {
	"utility/fragmentOutput": fragmentOutput,
	"utility/linearRGBToLinearDisplayP3": linearRGBToLinearDisplayP3,
	"utility/sRGB_gammaExpansion": sRGB_gammaExpansion,
	"utility/sRGB_gammaCompression": sRGB_gammaCompression,
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

export async function loadImageTexture(device: GPUDevice, imageUrl: string): Promise<GPUTexture> {
	const response = await fetch(imageUrl);
	const blob = await response.blob();
	const imageBitmap = await createImageBitmap(blob);

	const texture = device.createTexture({
		size: [imageBitmap.width, imageBitmap.height, 1],
		format: 'rgba8unorm',
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
	});

	device.queue.copyExternalImageToTexture(
		{ source: imageBitmap },
		{ texture: texture },
		[imageBitmap.width, imageBitmap.height]
	);

	return texture;
}

export function createSampler(device: GPUDevice): GPUSampler {
	return device.createSampler({
		minFilter: 'linear',
		magFilter: 'linear',
		addressModeU: 'repeat',
		addressModeV: 'repeat'
	});
}

export function createBindGroup(device: GPUDevice, texture: GPUTexture, sampler: GPUSampler): { group: GPUBindGroup, layout: GPUBindGroupLayout } {
	const textureView = texture.createView();

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: { sampleType: 'float' }
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {}
			}
		]
	});

	const bindGroup = device.createBindGroup({
		layout: bindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: textureView
			},
			{
				binding: 1,
				resource: sampler
			}
		]
	});

	return { group: bindGroup, layout: bindGroupLayout };
}