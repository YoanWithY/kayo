import { IconedToggleButton } from "../components/IconedToggleButton";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";

export class Footer extends HTMLElement {
	private _start!: HTMLDivElement;
	private _middle!: HTMLDivElement;
	private _end!: HTMLDivElement;

	public static createFooter(win: Window): Footer {
		const p = win.document.createElement("footer-element") as Footer;

		p._start = win.document.createElement("div");
		p._start.classList.add("start");
		p._middle = win.document.createElement("div");
		p._middle.classList.add("middle");
		p._end = win.document.createElement("div");
		p._end.classList.add("end");

		const fullScreenButton = IconedToggleButton.createIconedToggleButton(
			win,
			[
				{
					svgIcon: fullScreenOffIcon,
					callback: () => {
						if (win.document.fullscreenElement) win.document.exitFullscreen();
					},
				},
				{
					svgIcon: fullScreenOnIcon,
					callback: () => win.document.documentElement.requestFullscreen(),
				},
			],
			0,
		);

		const fullscreenChangeCallback = () => {
			if (!win.document.fullscreenElement) fullScreenButton.setStateUIOnly(0);
		};
		win.addEventListener("fullscreenchange", fullscreenChangeCallback);

		p._end.appendChild(fullScreenButton);

		const waterMark = document.createElement("span");
		waterMark.textContent = `Kayo Engine ${import.meta.env.PACKAGE_VERSION}`;
		p._start.appendChild(waterMark);

		p.appendChild(p._start);
		p.appendChild(p._middle);
		p.appendChild(p._end);
		return p;
	}
}
