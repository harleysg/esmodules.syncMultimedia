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
			resolve([...trackText["cues"]]);
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
	if (trackText == []) {
		throw new Error("El tag audio no tiene textTracks");
	}
	let trackCueList: object;
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
	async function asyncCall() {
		trackCueList = await resolveAfterXtime(trackText, 2000);
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
