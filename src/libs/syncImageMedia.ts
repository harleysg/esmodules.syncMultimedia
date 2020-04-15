interface IsyncImageMedia {
	scope: HTMLElement;
	readonly media: HTMLMediaElement;
	static?: string;
	dynamic?: string;
}

function handlelErrorParams(paramsObj: IsyncImageMedia) {
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
	if (!paramsObj.scope.dataset.static && !paramsObj.scope.dataset.dynamic) {
		console.error(
			"Requiere attribute data-static and data-dynamic OR Requiere properties static and dynamic"
		);
	}
}

function mediaEvents(
	{ media }: IsyncImageMedia,
	images: Array<HTMLImageElement>
) {
	media.addEventListener("play", toggleImage);
	media.addEventListener("pause", toggleImage);
	media.addEventListener("ended", toggleImage);
	media.addEventListener("seek", toggleImage);

	function toggleImage(event) {
		const { type } = event;
		if (type == "play") {
			images[0].style.display = "none";
			images[1].style.display = "block";
			return;
		}
		images[0].style.display = "block";
		images[1].style.display = "none";
	}
}

function loadImages(
	{ scope }: IsyncImageMedia,
	images: Array<HTMLImageElement>
) {
	scope.innerHTML = "";
	images.map((image) => scope.appendChild(image));
}

export default function (paramsObj: IsyncImageMedia) {
	handlelErrorParams(paramsObj);
	const staticImage = new Image();
	const dynamicImage = new Image();
	const staticSrc = paramsObj.static || paramsObj.scope.dataset.static || "";
	const dynamicSrc =
		paramsObj.dynamic || paramsObj.scope.dataset.dynamic || "";
	// Load image
	staticImage.src = staticSrc;
	dynamicImage.src = dynamicSrc;
	staticImage.style.display = "block";
	dynamicImage.style.display = "none";

	loadImages(paramsObj, [staticImage, dynamicImage]);
	mediaEvents(paramsObj, [staticImage, dynamicImage]);
}
