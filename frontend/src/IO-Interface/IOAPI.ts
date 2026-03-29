import { View } from "./Binding";

export interface IOAPI {
    addChangeObserver<T>(apiURL: string, view: View<T>, fireImmediately: boolean): void;
    setAPIValue(apiURL: string, value: any): void;
    APIName: string;
}