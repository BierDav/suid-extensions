# Suid Extensions

This small "gist" consists of these components which cannot currently be found in [@swordev/suid](https://github.com/swordev/suid), but might be handy for development. I share these components to:
1. hopefully improve suid in the longterm
2. help desperate developers out of their depression
3. give developers a place to share their custom useful components

Currently, you would have to copy the code from the repository to your project to use it, because I don't have enough time to set up a whole project with CI pipeline and so to publish it to npm. If you want to contribute, a pr with a full setup like this is welcomed.

## CtSelect

This is a MUI Select component which fully supports [SSR](https://github.com/swordev/suid/issues/268) and the [`<For/>` component](https://github.com/swordev/suid/issues/223). Unfortunately, it is not fully compatible with the original implementation of mui, because this would require to render the selectable items in advance which conflicts with the idea behind solid.js - performance.

Sample usage:
```typescript jsx

import CtSelect from "~/lib/suid/CtSelect/CtSelect";
import CtSelectItem from "~/lib/suid/CtSelect/CtSelectItem";
import {createSignal, For} from "solid-js";
import {Typography} from "@suid/material";

export default function () {
    const [value, setValue] = createSignal(0)
    return <>
        <CtSelect
            renderValue={v => "Item " + v} // this is how the item will be rendered in the component when selected, you can return JSX there
            value={value()} // this is currently only required to execute renderValue, but might be used in future for autofocus too
            onSelected={value1 => setValue(value1)} // the onChange alternative which only provides the newValue
            sx={{width: 200}} // this is a full-fledged suid component, so we have similar customization options
        >
            <For each={Array.from({length: 5}, (_, i) => i + 1)}>{item =>
                <CtSelectItem value={item}/> // We need this component, because it registers in the context of the CtSelect to forward click events
            }</For>
            <Typography variant={"overline"} sx={{ml:2}}>This is a category</Typography> {/*Will only be rendered in the popup as in the mui implementation*/}
            <CtSelectItem value={-1}>This will show as Item -1 when selected</CtSelectItem> {/*Per default, the `renderValue` function of the parent CtSelect will be used, but you can also override it by passing your own implementation*/}
        </CtSelect>
    </>
}


```

> Note: The component currently doesn't support autofocus. This is when you open the Menu the initially selected item is the one that is selected. This is quite useful, when working with a keyboard

> Also: I don't know why the MUI implementation includes a native select component (probably because of accessibility), but I had to remove the onChange listener on this native component. I didn't seam to do anything, but I don't know if I destroyed accessibility with that.

The name comes from an internal Project and has nothing to do with the functionality.


## LoadingButton

Implementation of the currently unsupported [LoadingButton](https://mui.com/material-ui/api/loading-button/) in the labs package of mui. Usage is the same als mui implementation, so see their documentation for more information.
