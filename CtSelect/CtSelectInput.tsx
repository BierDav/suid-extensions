/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {SelectInputTypeMap} from "./CtSelectInputProps";
import selectClasses, {getSelectUtilityClasses} from "./ctSelectClasses";
import createComponentFactory from "@suid/base/createComponentFactory";
import createRef from "@suid/system/createRef";
import {EventParam, PropsOf} from "@suid/types";
import capitalize from "@suid/utils/capitalize";
import ownerDocument from "@suid/utils/ownerDocument";
import clsx from "clsx";
import {
    createSignal,
    createEffect,
    on,
    splitProps,
    mergeProps, children,
} from "solid-js";
import {Menu, styled} from "@suid/material";
import {nativeSelectIconStyles, nativeSelectSelectStyles} from "@suid/material/NativeSelect/NativeSelectInput";
import {skipRootProps} from "@suid/material/styles/styled";
import useControlled from "@suid/material/utils/useControlled";
import {CtSelectionContext} from "~/lib/suid/CtSelect/CtSelectionContext";


type OwnerState = PropsOf<SelectInputTypeMap> & {
    variant: Exclude<SelectInputTypeMap["props"]["variant"], undefined>;
};

const $ = createComponentFactory<SelectInputTypeMap, OwnerState>()({
    name: "CtSelectInput",
    selfPropNames: [
        "autoFocus",
        "autoWidth",
        "defaultOpen",
        "disabled",
        "IconComponent",
        "inputRef",
        "MenuProps",
        "multiple",
        "name",
        "onBlur",
        "onSelected",
        "onClose",
        "onFocus",
        "onOpen",
        "open",
        "readOnly",
        "renderValue",
        "SelectDisplayProps",
        "tabIndex",
        "value",
        "variant",
    ],
    utilityClass: getSelectUtilityClasses,
    slotClasses: (ownerState) => ({
        select: [
            "select",
            ownerState.variant,
            ownerState.disabled && "disabled",
            ownerState.multiple && "multiple",
        ],
        icon: [
            "icon",
            `icon${capitalize(ownerState.variant)}`,
            ownerState.open && "iconOpen",
            ownerState.disabled && "disabled",
        ],
        nativeInput: ["nativeInput"],
    }),
});

const SelectSelect = styled("div", {
    name: "CtSelect",
    slot: "Select",
    overridesResolver: (props, styles) => {
        const {ownerState} = props;
        return [
            // Win specificity over the input base
            {[`&.${selectClasses.select}`]: styles.select},
            {[`&.${selectClasses.select}`]: styles[ownerState.variant]},
            {[`&.${selectClasses.multiple}`]: styles.multiple},
        ];
    },
})(nativeSelectSelectStyles, {
    // Win specificity over the input base
    [`&.${selectClasses.select}`]: {
        height: "auto", // Resets for multiple select with chips
        minHeight: "1.4375em", // Required for select\text-field height consistency
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
    },
});

const SelectIcon = styled("svg", {
    name: "CtSelect",
    slot: "Icon",
    overridesResolver: (props, styles) => {
        const {ownerState} = props;
        return [
            styles.icon,
            ownerState.variant && styles[`icon${capitalize(ownerState.variant)}`],
            ownerState.open && styles.iconOpen,
        ];
    },
})(nativeSelectIconStyles);

const SelectNativeInput = styled("input", {
    skipProps: skipRootProps,
    name: "CtSelect",
    slot: "NativeInput",
    overridesResolver: (props, styles) => styles.nativeInput,
})<OwnerState>({
    bottom: 0,
    left: 0,
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
    width: "100%",
    boxSizing: "border-box",
});


/**
 * @ignore - internal component.
 */
const CtSelectInput = $.defineComponent(function SelectInput(props) {
    const ref = createRef<typeof props.ref>(props);

    const [, other] = splitProps(props, [
        "ref",
        "sx", // [new]
        "aria-describedby",
        "aria-label",
        "autoFocus",
        "autoWidth",
        "children",
        "class",
        "defaultOpen",
        "defaultValue",
        "disabled",
        "displayEmpty",
        "IconComponent",
        "inputRef",
        "labelId",
        "MenuProps",
        "multiple",
        "name",
        "onBlur",
        "onClose",
        "onFocus",
        "onOpen",
        "open",
        "readOnly",
        "renderValue",
        "SelectDisplayProps",
        "tabIndex",
        "type",
        "value",
        "variant",
    ]);

    const baseProps = mergeProps(
        {
            MenuProps: {} as NonNullable<typeof props.MenuProps>,
            SelectDisplayProps: {} as NonNullable<typeof props.SelectDisplayProps>,
            variant: "standard" as const,
            renderValue: (value: any) => value,
        },
        props
    );

    const [value, setValueState] = useControlled({
        controlled: () => props.value,
        default: () => props.defaultValue,
        name: "Select",
    });

    const [openState, setOpenState] = useControlled({
        controlled: () => props.open,
        default: () => props.defaultOpen,
        name: "Select",
    });

    const inputRef = createRef<HTMLInputElement>();
    const [displayNode, setDisplayNode] = createSignal<HTMLElement | null>(null);
    const isOpenControlled = props.open != null;
    const [menuMinWidthState, setMenuMinWidthState] = createSignal<number | null>(
        null
    );
    const handleDisplayRef = (node: HTMLElement) => {
        setDisplayNode(node);
    };

    const action = {
        nodeName: "INPUT",
        get node() {
            return inputRef.current;
        },
        addEventListener(eventName: string, callback: () => any) {
            if (eventName !== "input")
                throw new Error(`Invalid event name: ${eventName}`);
            inputRef.current.addEventListener(eventName, callback);
        },
        get value() {
            return value();
        },
        set value(v) {
            setValueState(v);
        },
        focus() {
            inputRef.current.focus();
        },
    };

    // Resize menu on `defaultOpen` automatic toggle.
    createEffect(
        on(
            () => [displayNode(), props.autoWidth],
            () => {
                let displayElement = displayNode();
                if (
                    props.defaultOpen &&
                    openState() &&
                    displayElement &&
                    !isOpenControlled
                ) {
                    setMenuMinWidthState(
                        props.autoWidth ? null : displayElement.clientWidth
                    );
                    displayElement.focus();
                }
            }
        )
    );
    // `isOpenControlled` is ignored because the component should never switch between controlled and uncontrolled modes.
    // `defaultOpen` and `openState` are ignored to avoid unnecessary callbacks.
    createEffect(() => {
        if (props.autoFocus) {
            displayNode()?.focus();
        }
    });

    let clickHandler: (() => any) | undefined;

    createEffect(() => {
        if (!props.labelId) {
            return;
        }
        const label = ownerDocument(displayNode()).getElementById(
            props.labelId
        );
        if (label) {
            if (clickHandler) label.removeEventListener("click", clickHandler);
            clickHandler = () => {
                if (getSelection()!.isCollapsed) {
                    displayNode()?.focus();
                }
            };
            label.addEventListener("click", clickHandler);
        }
    });

    const update = (open: boolean, event: Event) => {
        // [review] FocusTrap
        if (!open) displayNode()?.focus();

        if (open) {
            if (props.onOpen) {
                props.onOpen(event);
            }
        } else if (props.onClose) {
            props.onClose(event);
        }
        if (!isOpenControlled) {
            setMenuMinWidthState(props.autoWidth ? null : displayNode()!.clientWidth);
            setOpenState(open);
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        if (props.disabled || props.readOnly) return;
        // Ignore everything but left-click
        if (event.button !== 0) {
            return;
        }
        // Hijack the default focus behavior.
        event.preventDefault();
        displayNode()?.focus();

        update(true, event);
    };

    const handleClose = (event: Event) => {
        update(false, event);
    };


    const handleKeyDown = (event: KeyboardEvent) => {
        if (!props.readOnly) {
            const validKeys = [
                " ",
                "ArrowUp",
                "ArrowDown",
                // The native select doesn't respond to enter on MacOS, but it's recommended by
                // https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
                "Enter",
            ];

            if (validKeys.indexOf(event.key) !== -1) {
                event.preventDefault();
                update(true, event);
            }
        }
    };

    const open = () => displayNode() !== null && !!openState();

    const handleBlur = (event: EventParam<HTMLElement, FocusEvent>) => {
        // if open event.stopImmediatePropagation
        if (!open() && props.onBlur) {
            // Preact support, target is read only property on a native event.
            Object.defineProperty(event, "target", {
                writable: true,
                value: {value: value(), name: props.name},
            });
            props.onBlur(event);
        }
    };


    /*if (process.env.NODE_ENV !== "production") {
      createEffect(
        on(
          () => [foundMatch, items(), props.multiple, props.name, value()],
          () => {
            if (!foundMatch && !props.multiple && value() !== "") {
              const values = items().filter((child => isComponentObject(child, MenuItem)).map((child) => child.props.value);
              console.warn(
                [
                  `MUI: You have provided an out-of-range value \`${value}\` for the select ${
                    props.name ? `(name="${props.name}") ` : ""
                  }component.`,
                  "Consider providing a value that matches one of the available options or ''.",
                  `The available values are ${
                    values
                      .filter((x) => x != null)
                      .map((x) => `\`${x}\``)
                      .join(", ") || '""'
                  }.`,
                ].join("\n")
              );
            }
          }
        )
      );
    }*/

    // Avoid performing a layout computation in the render method.
    const menuMinWidth = () => {
        let menuMinWidth = menuMinWidthState();

        if (!props.autoWidth && isOpenControlled && displayNode()) {
            menuMinWidth = displayNode()!.clientWidth;
        }

        return menuMinWidth;
    };

    const PaperProps = mergeProps(() => baseProps.MenuProps.PaperProps, {
        style: mergeProps(
            {
                get "min-width"() {
                    const v = menuMinWidth();
                    return typeof v === "number" ? `${v}px` : undefined;
                },
            },
            () =>
                baseProps.MenuProps.PaperProps != null
                    ? baseProps.MenuProps.PaperProps.style
                    : null
        ),
    });

    const MenuListProps = mergeProps(
        {
            get "aria-labelledby"() {
                return props.labelId;
            },
            ["role" as any]: "listbox",
            disableListWrap: true,
        },
        () => baseProps.MenuProps.MenuListProps
    );

    const tabIndex = () => {
        if (typeof props.tabIndex !== "undefined") {
            return props.tabIndex;
        } else {
            return props.disabled ? undefined : 0;
        }
    };

    const buttonId = () =>
        baseProps.SelectDisplayProps.id ||
        (props.name ? `mui-component-select-${props.name}` : undefined);

    const ownerState = mergeProps(props, {
        get variant() {
            return baseProps.variant;
        },
        get value() {
            return value();
        },
        get open() {
            return open();
        },
    });

    const classes = $.useClasses(ownerState);
    const nativeSelectValue = () => {
        const v = value();
        return Array.isArray(v) ? v.join(",") : v;
    };

    return (
        <>
            <SelectSelect
                ref={handleDisplayRef}
                tabIndex={tabIndex()}
                role="button"
                aria-disabled={props.disabled ? "true" : undefined}
                aria-expanded={open() ? "true" : "false"}
                aria-haspopup="listbox"
                aria-label={props["aria-label"]}
                aria-labelledby={
                    [props.labelId, buttonId()].filter(Boolean).join(" ") || undefined
                }
                aria-describedby={props["aria-describedby"]}
                onKeyDown={handleKeyDown}
                onMouseDown={handleMouseDown}
                onBlur={handleBlur}
                onFocus={props.onFocus}
                {...baseProps.SelectDisplayProps}
                ownerState={ownerState}
                sx={props.sx}
                class={clsx(
                    classes.select,
                    props.class,
                    baseProps.SelectDisplayProps.class
                )}
                // The id is required for proper a11y
                id={buttonId()}
            >
                {baseProps.renderValue(value())}
            </SelectSelect>

            <SelectNativeInput
                value={nativeSelectValue()}
                data-value={nativeSelectValue()}
                name={props.name}
                aria-hidden
                ref={(e) => {
                    inputRef(e);
                    if (typeof props.inputRef === "function") props.inputRef(action);
                    ref(action as any);
                }}
                tabIndex={-1}
                disabled={props.disabled}
                class={classes.nativeInput}
                autofocus={props.autoFocus}
                ownerState={ownerState}
                {...other}
            />
            <SelectIcon
                as={props.IconComponent}
                class={classes.icon}
                ownerState={ownerState}
            />
            <CtSelectionContext.Provider value={{
                renderValue: baseProps.renderValue,
                selectedValue: value,
                onSelected: (e, value) => {
                    handleClose(e)
                    props.onSelected?.(value)
                }
            }}>
                <Menu
                    id={`menu-${props.name || ""}`}
                    anchorEl={displayNode()}
                    open={open()}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    {...baseProps.MenuProps}
                    MenuListProps={MenuListProps}
                    PaperProps={PaperProps}
                >
                    {props.children}
                </Menu>
            </CtSelectionContext.Provider>
        </>
    );
});

export default CtSelectInput;
