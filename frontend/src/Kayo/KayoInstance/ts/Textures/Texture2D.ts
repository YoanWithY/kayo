export interface Texture2D {
	/**
	 * The unique id of the texture.
	 */
	uid: string;
	/**
	 * The width of the texture in texels.
	 */
	width: number;
	/**
	 * The height of the texture in texels.
	 */
	height: number;
	/**
	 * The sampling properies of the texture.
	 */
	samplingDescriptor: GPUSamplerDescriptor;
}
