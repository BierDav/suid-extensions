import {createContext, JSX, useContext} from "solid-js";

type CtSelectionContextType = {
    onSelected: (event: MouseEvent & { currentTarget: HTMLLIElement }, value: string | number | undefined) => void;
    selectedValue: () => string | number | undefined;
    renderValue: (value: string | number | undefined) => JSX.Element;
}
export const CtSelectionContext = createContext<CtSelectionContextType>();

export function useCtSelectionContext() {
    return useContext(CtSelectionContext)
}
