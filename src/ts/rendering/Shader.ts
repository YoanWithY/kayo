import linearRGBToLinearDisplayP3 from "../../wgsl/utility/linearRGBToLinearDisplayP3.wgsl?raw";
import sRGB_EOTF from "../../wgsl/utility/sRGB_EOTF.wgsl?raw";
import sRGB_OETF from "../../wgsl/utility/sRGB_OETF.wgsl?raw";
import fragmentOutput from "../../wgsl/utility/fragmentOutput.wgsl?raw";

const snippets: { [key: string]: string } = {
	"utility/fragmentOutput": fragmentOutput,
	"utility/linearRGBToLinearDisplayP3": linearRGBToLinearDisplayP3,
	"utility/sRGB_EOTF": sRGB_EOTF,
	"utility/sRGB_OETF": sRGB_OETF,
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