import {MenuItem} from "@suid/material";
import {useCtSelectionContext} from "~/lib/suid/CtSelect/CtSelectionContext";
import {createEffect, createSignal, JSXElement, on} from "solid-js";

export default function CtSelectItem(props: { children?: JSXElement, value?: number | string }) {
    const selectContext = useCtSelectionContext();
    const [ref, setRef] = createSignal<HTMLElement | null>(null)
    createEffect(on(() => [ref()], () => {
        let ref1 = ref();
        if (ref1 !== null && props.value === selectContext?.selectedValue())
            ref1.focus();
    }))
    return (<>
        <MenuItem ref={setRef} value={props.value} onClick={(e) => {
            if (!e.target!.hasAttribute("tabindex"))
                return;
            selectContext?.onSelected(e, props.value)
            e.preventDefault()
        }}>
            {props.children || selectContext?.renderValue(props.value)}
        </MenuItem>
    </>)
}
