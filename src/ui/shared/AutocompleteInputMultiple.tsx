import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';
import { fr } from "@codegouvfr/react-dsfr";
import {makeStyles} from "tss-react/dsfr";
import { MultiSelect } from "./MultiSelect";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

const LISTBOX_PADDING = 8; // px

type Option = {
    value: string
    label: string
}

type Props = {
    id: string
    options: Option[]
    selectedValues: string[]
    onChange: (options: string[]) => void;
}

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
        ...style,
        top: (style.top as number) + LISTBOX_PADDING,
    };

    return (
        <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
            <Checkbox checked={dataSet[0]["aria-selected"]} />
            {`${dataSet[1].label}`}
        </Typography>
    );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactChild[] = [];
    (children as React.ReactChild[]).forEach(
        (item: React.ReactChild & { children?: React.ReactChild[] }) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        },
    );

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: React.ReactChild) => {
        if (child.hasOwnProperty('group')) {
            return 48;
        }

        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
            width: "100%"
        },
    },
});

export function AutocompleteInputMultiple(props: Props) {
    const { options, selectedValues, onChange} = props
    const {cx, classes} = useStyles();
    const value = options.filter(option => selectedValues.includes(option.value))

    return (
        <Autocomplete
            id="virtualize-autocomplete"
            multiple
            disableCloseOnSelect
            disableListWrap
            limitTags={2}
            getOptionLabel={({ label }) => label}
            PopperComponent={StyledPopper}
            ListboxComponent={ListboxComponent}
            options={options}
            value={value}
            renderInput={(params) => <TextField {...params} variant={"standard"} />}
            renderOption={(props, option, state) =>
                [props, option, state.index] as React.ReactNode
            }
            onChange={(_event, options) => {
                const values = options.map(value => value.value)
                onChange(values)
            }}
            className={cx(fr.cx("fr-select"), classes.multiSelect)}
            renderTags={(tagValue) => {
                return tagValue.map((option, index) => (
                    <span
                        className={cx(
                            fr.cx(
                                "fr-badge--no-icon",
                                "fr-badge--yellow-moutarde",
                                "fr-badge",
                            )
                        )}
                        key={index}
                    >
                        {option.label}
                    </span>
                ));
            }}
        />
    );
}


const useStyles = makeStyles({name: {MultiSelect}})(() => ({
    root: {},
    multiSelect: {
        marginTop: fr.spacing("2v"),
        paddingRight: 0,
        "&& .MuiInputBase-input": {
            padding: 0,
        },
        "&& .MuiInputBase-root": {
            gap: fr.spacing("2v"),

            "&::before" : {
                borderBottom: "none",
                content: "none"
            },
            "&:hover &&::before" : {
                borderBottom: "none"
            },
            "&::after" : {
                borderBottom: "none"
            }
        },
        "&& .MuiSvgIcon-root": {
            display: "none"
        }
    },
}));
