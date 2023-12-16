import {createEffect, createSignal, ParentProps} from "solid-js";
import styles from "./Collapse.module.css"
import {resolveFirst} from "@solid-primitives/refs";
import useTheme from "@suid/system/useTheme";

export function Collapse<T>(props: ParentProps & { in: T | undefined | null | false }) {
    const [, setAnimation] = createSignal<Animation>()
    const [hidden, setHidden] = createSignal<boolean>(!props.in)
    const theme = useTheme()

    const div = resolveFirst(() =>
        <div class={styles.collapsing} classList={{[styles.hidden]: hidden()}}>{props.children}</div>);

    createEffect(() => {
        const curr = div();
        if (!curr)
            return
        setAnimation((old) => {
            if(hidden() && !props.in)
                return
            const currentHeight = hidden() ? 0 : curr.getBoundingClientRect().height + 'px';
            const targetHeight = props.in ? curr.scrollHeight + 'px' : 0
            old?.cancel()

            const anim = curr?.animate(
                [{height: currentHeight}, {height: targetHeight}],
                {
                    duration: theme.transitions.duration.standard,
                    easing: theme.transitions.easing.easeInOut,
                }
            )
            setHidden(false)
            if (!props.in)
                anim.onfinish = () => setHidden(true)
            return anim
        })
    }, [props.in])
    return div();
}
