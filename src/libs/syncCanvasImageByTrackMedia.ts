interface IParams {
	readonly scope: HTMLElement;
	readonly media: HTMLMediaElement;
}

interface IsetCanvasProperties {
	image: HTMLImageElement;
}

function setCanvasProperties(
	canvas: HTMLCanvasElement,
	params: IsetCanvasProperties
): HTMLCanvasElement {
	canvas.width = params.image.width;
	canvas.height = params.image.height;
	const canvasStyle = getComputedStyle(canvas);
	const w = canvasStyle.width;
	const h = canvasStyle.height;
	canvas.width = Number(w[0]);
	canvas.height = Number(h[0]);
	return canvas;
}

function newCanvas(scope: HTMLElement): HTMLCanvasElement {
	const newCanvas = document.createElement("canvas");
	scope.innerHTML = "";
	scope.appendChild(newCanvas);
	return newCanvas;
}

function handlelErrorParams(paramsObj: IParams) {
	if (!paramsObj) {
		throw new Error("function requiere parametros.");
	}
	if (typeof paramsObj !== "object") {
		throw new Error("function requiere type object.");
	}
	if (!paramsObj["scope"]) {
		throw new Error("Requiere property scope: HTMLElement.");
	}
	if (!paramsObj["media"]) {
		throw new Error("Requiere property media: HTMLMediaElement.");
	}
	if (paramsObj.scope.querySelector("canvas") === null) {
		newCanvas(paramsObj.scope);
	}
	if (!paramsObj.scope.dataset.static && !paramsObj.scope.dataset.dynamic) {
		throw new Error("Requiere attribute data-statis and data-dynamic");
	}
}

/**
 *
 * @param paramsObj
 * @summary Esta función permite cambiar imagen de formato PNG ó JPG dentro de un canvas
 * @returns Canvas
 * @author Harley Santos Garzón
 * @ignore file GIF
 */

export default function (paramsObj: IParams): HTMLCanvasElement {
	let canvas: HTMLCanvasElement;
	handlelErrorParams(paramsObj);
	const scope = paramsObj.scope;
	const media = paramsObj.media;
	canvas = scope.querySelector("canvas") || newCanvas(scope);
	const ctx = canvas.getContext("2d");
	// Create Images
	const staticImage = new Image();
	const dynamicImage = new Image();
	const staticSrc = paramsObj.scope.dataset.static || "";
	const dynamicSrc = paramsObj.scope.dataset.dynamic || "";
	// Load image
	staticImage.src = staticSrc;
	dynamicImage.src = dynamicSrc;
	setCanvasProperties(canvas, { image: staticImage });

	staticImage.addEventListener("load", loadImage);
	media.addEventListener("play", () => loadImageToCanvas(dynamicImage));
	media.addEventListener("pause", () => loadImageToCanvas(staticImage));
	media.addEventListener("ended", () => loadImageToCanvas(staticImage));
	media.addEventListener("seek", () => loadImageToCanvas(staticImage));

	async function loadImage() {
		await loadImageToCanvas(staticImage);
	}
	async function loadImageToCanvas(image) {
		if (!ctx) {
			throw new Error(
				`2d context not supported or canvas already initialized`
			);
		}
		canvas.width = image.width;
		canvas.height = image.height;
		await ctx.drawImage(image, 0, 0, image.width, image.height);
	}
	return canvas;
}
