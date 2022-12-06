import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Radio,
  Stack
} from "@mui/material"
import { useEffect, useState } from "react"

import { googleSheetsManager } from "~lib/google-sheets"

import { DeleteIcon } from "./icons/DeleteIcon"
import { DownArrowIcon } from "./icons/DownArrowIcon"
import { WifiIcon } from "./icons/WifiIcon"

function encodeStr(str: String) {
  return `${str.substr(0, 5)}...${str.substr(-4)}`
}

export function SheetsSelector() {
  const [sheetIds, setSheetIds] = useState(googleSheetsManager.getSheetIds())
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(1)
  const open = Boolean(anchorEl)
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setSelectedIndex(index)
    setAnchorEl(null)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  console.log(sheetIds, "sheetIds")

  useEffect(() => {
    const sub = googleSheetsManager.sheets.subscribe(({ value }) => {
      setSheetIds(value)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        onClick={handleClickListItem}>
        <WifiIcon color="inherit" fontSize="small" />
        <span>hello world</span>
        <DownArrowIcon />
      </Stack>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}>
        <List sx={{ width: "100%", maxWidth: 360 }}>
          {sheetIds.map((option, index) => (
            <ListItem
              key={option}
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="comments">
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding>
              <ListItemButton
                selected={index === selectedIndex}
                onClick={(event) => handleMenuItemClick(event, index)}>
                <ListItemIcon>
                  <Radio
                    color="success"
                    edge="start"
                    checked={index === selectedIndex}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={index}
                  secondary={option}
                  secondaryTypographyProps={{ sx: { wordBreak: "break-all" } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  )
}
