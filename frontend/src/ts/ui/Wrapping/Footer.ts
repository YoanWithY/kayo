import { IconedToggleButton } from "../components/IconedToggleButton";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";

export class Footer extends HTMLElement {
	start!: HTMLDivElement;
	middle!: HTMLDivElement;
	end!: HTMLDivElement;

	static createFooter(win: Window): Footer {
		const p = win.document.createElement("footer-element") as Footer;

		p.start = win.document.createElement("div");
		p.start.classList.add("start");
		p.middle = win.document.createElement("div");
		p.middle.classList.add("middle");
		p.end = win.document.createElement("div");
		p.end.classList.add("end");

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

		win.addEventListener("fullscreenchange", () => {
			if (!win.document.fullscreenElement) fullScreenButton.setStateUIOnly(0);
		});

		p.end.appendChild(fullScreenButton);

		const waterMark = document.createElement("span");
		waterMark.textContent = "Kayo Engine Pre-Alpha 0.0.6";
		p.start.appendChild(waterMark);

		p.appendChild(p.start);
		p.appendChild(p.middle);
		p.appendChild(p.end);
		return p;
	}
}
