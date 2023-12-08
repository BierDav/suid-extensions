import {SelectTypeMap} from ".";
import CtSelectInput from "./CtSelectInput";
import createComponentFactory from "@suid/base/createComponentFactory";
import Dynamic from "@suid/system/Dynamic";
import {StyledOptions} from "@suid/system/createStyled";
import {DefaultComponentProps} from "@suid/types";
import {deepmerge} from "@suid/utils";
import {splitProps, mergeProps, JSX} from "solid-js";
import {skipRootProps} from "@suid/material/styles/styled";
import {FilledInput, Input, OutlinedInput, styled} from "@suid/material";
import {ArrowDropDown} from "@suid/icons-material";
import NativeSelectInput from "@suid/material/NativeSelect/NativeSelectInput";
import {useFormControl} from "@suid/material/FormControl";
import formControlState from "@suid/material/FormControl/formControlState";

const $ = createComponentFactory<SelectTypeMap>()({
    name: "CtSelect",
    selfPropNames: [
        "autoWidth",
        "children",
        "classes",
        "defaultOpen",
        "defaultValue",
        "displayEmpty",
        "IconComponent",
        "id",
        "label",
        "labelId",
        "MenuProps",
        "multiple",
        "onSelected",
        "onClose",
        "onOpen",
        "open",
        "renderValue",
        "SelectDisplayProps",
        "value",
        "variant",
    ],
});

const styledRootConfig: StyledOptions<"CtSelect"> = {
    name: "CtSelect",
    overridesResolver: (props, styles) => styles.root,
    skipProps: [...skipRootProps, "variant"],
    slot: "Root",
};

const StyledInput = styled(Input, styledRootConfig)({});

const StyledOutlinedInput = styled(OutlinedInput, styledRootConfig)({});

const StyledFilledInput = styled(FilledInput, styledRootConfig)({});

/**
 *
 * Demos:
 *
 * - [Selects](https://mui.com/components/selects/)
 *
 * API:
 *
 * - [Select API](https://mui.com/api/select/)
 * - inherits [OutlinedInput API](https://mui.com/api/outlined-input/)
 */
const CtSelect = $.defineComponent(function Select(inProps) {
    const props = $.useThemeProps({props: inProps});
    const [, other] = splitProps(props, [
        "autoWidth",
        "children",
        "classes",
        "class",
        "defaultOpen",
        "displayEmpty",
        "IconComponent",
        "id",
        "label",
        "labelId",
        "MenuProps",
        "multiple",
        "onSelected",
        "onClose",
        "onOpen",
        "open",
        "renderValue",
        "SelectDisplayProps",
        "variant",
    ]);

    const baseProps = mergeProps(
        {
            autoWidth: false,
            classes: {},
            defaultOpen: false,
            displayEmpty: false,
            IconComponent: ArrowDropDown,
            multiple: false,
            native: false,
            variant: "outlined",
        },
        props
    );

    const inputComponent = () =>
        baseProps.native ? NativeSelectInput : CtSelectInput;

    const muiFormControl = useFormControl();
    const fcs = formControlState({
        props: props,
        muiFormControl: muiFormControl,
        states: ["variant"],
    });

    const variant = () => fcs.variant || baseProps.variant;

    const InputComponent = () => ({
        standard: StyledInput,
        outlined: StyledOutlinedInput,
        filled: StyledFilledInput,
    })[variant()];

    const ownerState = mergeProps(props, {
        get variant() {
            return variant();
        },
        get classes() {
            return baseProps.classes;
        },
    });
    const classes = $.useClasses(ownerState);

    const inputProps = mergeProps(
        {
            get children() {
                return props.children;
            },
            get IconComponent() {
                return baseProps.IconComponent;
            },
            get variant() {
                return variant();
            },
            type: undefined,
            get multiple() {
                return baseProps.multiple;
            },
        },
        () =>
            baseProps.native
                ? {id: props.id}
                : {
                    autoWidth: baseProps.autoWidth,
                    defaultOpen: baseProps.defaultOpen,
                    displayEmpty: baseProps.displayEmpty,
                    labelId: props.labelId,
                    MenuProps: props.MenuProps,
                    onSelected: props.onSelected,
                    onClose: props.onClose,
                    onOpen: props.onOpen,
                    open: props.open,
                    renderValue: props.renderValue,
                    SelectDisplayProps: {
                        id: props.id,
                        ...props.SelectDisplayProps,
                    },
                },
        () => props.inputProps,
        {
            get classes() {
                return props.inputProps
                    ? deepmerge(classes, (props.inputProps as any).classes)
                    : classes;
            },
        }
    );

    return (
        <Dynamic
            $component={InputComponent()}
            inputComponent={inputComponent()}
            inputProps={inputProps}
            notched={
                props.multiple && variant() === "outlined"
                    ? true
                    : undefined
            }
            label={
                variant() === "outlined" ? props.label : undefined
            }
            class={props.class}
            variant={variant()}
            {...other}
        />
    );
}) as {
    <V = any>(
        props: DefaultComponentProps<SelectTypeMap<{}, "div", V>>
    ): JSX.Element;
    __suid: string;
};

export default CtSelect;
