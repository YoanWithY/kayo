export interface ViewTarget<O> {
    addChangeObserver(o: View<O>, fireImmediately: boolean): void;
}

export interface ControlTarget<I> {
    setValue(v: I, fireImmediately: boolean): void;
}

export interface ViewControllTarget<I, O> extends ControlTarget<I>, ViewTarget<O> {
}

export interface View<O> {
    recieveValueChange(v: O): void;
}