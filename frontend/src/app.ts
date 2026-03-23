import { KayoAPI } from "./Kayo/KayoAPI/KayoAPI";

// eslint-disable-next-line local/no-await
const kayoAPI = await KayoAPI.createInstance(true);

if (typeof kayoAPI === "string") {
	alert(`Could not start Kayo! Resons:\n${kayoAPI}`);
	throw new Error();
}
