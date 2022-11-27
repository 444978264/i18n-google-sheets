import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete"
import ListSubheader from "@mui/material/ListSubheader"
import Popper from "@mui/material/Popper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { alpha, styled, useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import * as React from "react"
import { ListChildComponentProps, VariableSizeList } from "react-window"

const LISTBOX_PADDING = 8 // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  const dataSet = data[index]
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING
  }

  if (dataSet.hasOwnProperty("group")) {
    return (
      <ListSubheader
        key={dataSet.key}
        component="li"
        style={inlineStyle}
        sx={{
          bgcolor({ palette }) {
            return alpha(palette.text.secondary, 0.05)
          },
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          fontSize: 18
        }}>
        {dataSet.group}
      </ListSubheader>
    )
  }

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      {dataSet[1]}
    </Typography>
  )
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null)
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [data])
  return ref
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props
  const itemData: React.ReactChild[] = []
  ;(children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item)
      itemData.push(...(item.children || []))
    }
  )

  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
    noSsr: true
  })
  const itemCount = itemData.length
  const itemSize = smUp ? 36 : 48

  const getChildSize = (child: React.ReactChild) => {
    if (child.hasOwnProperty("group")) {
      return 32
    }
    return itemSize
  }

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
  }

  const gridRef = useResetCache(itemCount)

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
          itemCount={itemCount}>
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  )
})

function random(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0
    }
  }
})

const OPTIONS = Array.from(new Array(10000))
  .map(() => random(10 + Math.ceil(Math.random() * 20)))
  .sort((a: string, b: string) =>
    a.toUpperCase().localeCompare(b.toUpperCase())
  )

export function SearchInput() {
  return (
    <Autocomplete
      fullWidth
      size="small"
      id="virtualize-demo"
      disableListWrap
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      options={OPTIONS}
      groupBy={(option) => option[0].toUpperCase()}
      renderInput={(params) => (
        <TextField {...params} placeholder="Search (Text or Key) " />
      )}
      renderOption={(props, option) => [props, option] as React.ReactNode}
      // TODO: Post React 18 update - validate this conversion, look like a hidden bug
      renderGroup={(params) => params as unknown as React.ReactNode}
    />
  )
}
