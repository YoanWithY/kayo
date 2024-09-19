export class Footer extends HTMLElement {
	waterMark!: HTMLSpanElement;
	perf!: HTMLSpanElement;
	static createFooter(): Footer {
		const p = document.createElement("footer-element") as Footer;
		p.perf = document.createElement("span");
		p.waterMark = document.createElement("span");
		p.waterMark.textContent = "Kayo Engine: Pre-Alpha 0.0.1";
		p.appendChild(p.waterMark);
		p.appendChild(p.perf);
		return p;
	}
}