export interface BindingTarget<T> {
    addBindingObserver(f: (v: T) => void, fireImmediately: boolean): void;
}

export interface Bindable<T> {
    bind(target: BindingTarget<T>): void;
}