import { PageContext } from "../PageContext";
import StateVariable from "../project/StateVariable";
import UIVariableComponent from "../ui/components/UIComponent";
import BasicPane from "../ui/panes/BasicPane";
import ptpChatTemplate from "./ptpChatPaneTemplate.json"

export class PTPChatContent extends UIVariableComponent<string[]> {
	private _win!: Window;
	texts: HTMLParagraphElement[] = []
	rebuild(value: string[]) {
		for (const t of this.texts)
			this.removeChild(t);
		this.texts.length = 0;
		for (const v of value) {
			const p = this._win.document.createElement("p");
			p.textContent = v;
			this.texts.push(p);
			this.appendChild(p);
		}
	}

	setValue(value: string[]): void {
		this.rebuild(value);
	}

	public static createUIElement(win: Window, pageContext: PageContext, obj: any): PTPChatContent {
		const p = win.document.createElement(this.getDomClass()) as PTPChatContent;
		p._win = win;
		p.stateVariable = pageContext.project.getVariableFromURL(obj.stateVariableURL) as StateVariable<string[]>;;
		p.stateVariable.bind(p);
		return p;
	}

	public static getDomClass() {
		return "ptp-chat-content";
	}

}

export class PTPChatPane extends BasicPane {
	public static createUIElement(win: Window, pageContext: PageContext): PTPChatPane {
		return super.createUIElement(win, pageContext, ptpChatTemplate) as PTPChatPane;
	}

	public static getDomClass() {
		return "ptp-chat";
	}

	connectedCallback() {
		this.pageContext.project.ptpBase.role.sendMessage("He connected.");
	}

	disconnectedCallback() {
		this.pageContext.project.ptpBase.role.sendMessage("He disconnected.");
	}

}