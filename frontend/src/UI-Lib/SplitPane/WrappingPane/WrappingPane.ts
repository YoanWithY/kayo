
import { UIElementBuilder } from "../../UIElementBuilder";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import { SplitPaneContainer, SplitPaneContainerBuilder } from "../SplitPaneContainer/SplitPaneContainer";
import css from "./WrappingPane.css?inline";

export class WrappingPane extends HTMLElement {
	public _header?: HTMLDivElement;
	public baseSplitPaneContainer!: SplitPaneContainer;
}

export class WrappingPaneBuilder<T extends IOAPI> extends UIElementBuilder<T, WrappingPane> {
	protected _domClassName = "wrapping-pane";
	protected get _domClass(): CustomElementConstructor {
		return WrappingPane;
	}

	public build(config: { domClassName: string, defaultElementClassName: string, useHeader: boolean }): WrappingPane {
		const wrappingPane = this.createElement<WrappingPane>(this._domClassName);

		const splitPaneContainerBuilder = this.windowUIBuilder.getBuilder<SplitPaneContainerBuilder<T>>("split-pane-container");
		if (!splitPaneContainerBuilder) {
			console.error("Could not get SplitPaneContainerBuilder!")
			return wrappingPane;
		}
		wrappingPane.baseSplitPaneContainer = splitPaneContainerBuilder.createRoot(this.windowUIBuilder, { defaultElementClassName: config.defaultElementClassName, uiRoot: wrappingPane });

		if (config.useHeader) {
			// todo
		}

		wrappingPane.appendChild(wrappingPane.baseSplitPaneContainer);
		return wrappingPane;
	}

	public _initWindowComponentStyles(): void {
		this.addStyle(css);
	}
}
