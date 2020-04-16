interface Callback {
	cb_create?: Function;
	cb_animate?: Function;
	sync_image?: {
		image: HTMLImageElement;
		static: string;
		dynamic: string;
		cb: Function;
	};
	hiddenAll?: boolean | undefined;
}

interface CB_AniTrack_Params {
	cues: TextTrackCueList;
	i: number;
	ui_trackContent: HTMLElement | SVGAElement;
	hiddenAll: boolean | undefined;
	ui_multimedia: HTMLMediaElement;
	activeCuesById: string;
}

function callBack_animateTrack(objParams: CB_AniTrack_Params) {
	const { i, ui_trackContent, hiddenAll, activeCuesById } = objParams;
	let ariaStatus = hiddenAll ? true : false;
	let currentChildren = ui_trackContent.children[i];
	let currentClassList = currentChildren && currentChildren.classList;

	if (currentChildren && currentClassList.contains("cue-active")) {
		ariaStatus && currentClassList.remove("cue-active");
	}

	if (activeCuesById) {
		setTimeout(() => {
			i == 0 && currentClassList.add("cue-active");
		}, 100);
		currentChildren &&
			activeCuesById["id"] == currentChildren.getAttribute("cue-id") &&
			currentClassList.add("cue-active");
		return;
	}
}

function resolveAfterXtime(
	trackText: TextTrack | never[],
	time: number
): Promise<{}> {
	return new Promise<{}>((resolve) => {
		setTimeout(() => {
			resolve({ cues: [...trackText["cues"]] });
		}, time);
	});
}

export default async function (
	ui_multimedia: HTMLMediaElement,
	ui_trackContent: HTMLElement,
	callback: Callback
) {
	if (ui_multimedia == null) {
		throw new Error("Debe referenciar el tag audio o video");
	}
	if (ui_trackContent == null) {
		throw new Error("Debe referenciar el contenedor ui_trackContent");
	}
	const trackText = ui_multimedia.textTracks
		? ui_multimedia.textTracks[0]
		: [];
	if (trackText == [] || trackText == undefined) {
		throw new Error("El tag audio no tiene textTracks");
	}
	let trackCueList: TextTrackCueList;
	callback.cb_create ? (ui_trackContent.innerHTML = "") : null;

	/**
	 * Core function
	 */

	function maptrackCueList(cues: TextTrackCueList, i: number) {
		callback.cb_create && callback.cb_create({ cues, i, ui_trackContent });
	}
	function animateWhenCueChange(cues: TextTrackCueList, i: number) {
		const activeCues = cues["track"].activeCues;
		const activeCuesById: string = activeCues.getCueById(cues["id"]);
		const paramsCB: CB_AniTrack_Params = {
			cues,
			i,
			ui_trackContent,
			hiddenAll: callback.hiddenAll,
			ui_multimedia,
			activeCuesById,
		};

		callback.cb_animate
			? callback.cb_animate(paramsCB)
			: callBack_animateTrack(paramsCB);
	}
	function notificateError(multimedia: HTMLMediaElement, action: boolean) {
		if (action == true) {
			ui_multimedia.style.pointerEvents = "none";
			ui_multimedia.insertAdjacentHTML(
				"afterend",
				`<div class="msn-errorVtt">
				No ha cargado el vtt, 
				recargar la página o revisar la velocidad de conexión.</div>`
			);
			setTimeout(removeMessage, 3000);
		} else {
			ui_multimedia.style.removeProperty;
			removeMessage();
		}

		function removeMessage() {
			if (
				ui_multimedia.nextElementSibling &&
				ui_multimedia.nextElementSibling.classList.contains(
					"msn-errorVtt"
				)
			) {
				ui_multimedia.nextElementSibling.remove();
			}
		}
	}
	function isLoadingVtt(counter: number, multimedia: HTMLMediaElement) {
		if (counter < 0) {
			notificateError(ui_multimedia, true);
			throw new Error(
				`No ha cargado el vtt, 
				recargar la página o revisar la velocidad de conexión.`
			);
		} else {
			notificateError(ui_multimedia, false);
			console.log("loading...");
		}
	}
	async function asyncCall() {
		let countInt: number = 3;
		let arrayFromTrackCueList: TextTrackCue[] | [];
		do {
			const getTextTrackCueList = await resolveAfterXtime(
				trackText,
				2000
			);
			trackCueList = getTextTrackCueList["cues"];
			arrayFromTrackCueList = [...trackCueList];
			countInt--;
			isLoadingVtt(countInt, ui_multimedia);
		} while (arrayFromTrackCueList.length < 1);

		if (Array.isArray(trackCueList)) {
			callback.cb_create && trackCueList.map(maptrackCueList);
		}
	}
	if (trackText) {
		trackText["mode"] = "hidden";

		await asyncCall();

		trackText["oncuechange"] = function () {
			if (Array.isArray(trackCueList)) {
				trackCueList.map(animateWhenCueChange);
			}
		};
		return trackText;
	}
}
