import {
  Box,
  ButtonBase,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Radio,
  Stack,
  Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { Subscription } from "rxjs"

import { googleSheetsManager } from "~lib/google-sheets"

import { useWorkSheets } from "./GoogleSheetsProvider"
import { DeleteIcon } from "./icons/DeleteIcon"
import { DownArrowIcon } from "./icons/DownArrowIcon"
import { WifiIcon } from "./icons/WifiIcon"

function encodeStr(str: String) {
  return `${str.substr(0, 5)}...${str.substr(-4)}`
}

export function SheetsSelector() {
  const workSheet = useWorkSheets()
  const [loading, setLoading] = useState(false)
  const [sheetIds, setSheetIds] = useState(googleSheetsManager.getSheetIds())
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const sub = new Subscription()

    sub.add(
      googleSheetsManager.sheets.subscribe((value) => {
        setSheetIds(value)
      })
    )

    sub.add(
      googleSheetsManager.onLoad(() => {
        console.log("loading...", "workSheets")
        setLoading(true)
        return () => {
          console.log("complete...", "workSheets")
          setLoading(false)
        }
      })
    )

    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <>
      <Stack
        disabled={!sheetIds.length}
        component={ButtonBase}
        sx={{ cursor: "pointer" }}
        border={({ palette }) => {
          return `1px solid ${palette.divider}`
        }}
        px={1}
        py={0.8}
        borderRadius={12}
        height="48"
        direction="row"
        spacing={1}
        alignItems="center"
        onClick={handleClickListItem}>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <WifiIcon color={workSheet ? "success" : "action"} fontSize="small" />
        )}
        <Typography noWrap variant="button">
          {workSheet
            ? encodeStr(workSheet.spreadsheetId)
            : "No Sheet Connected"}
        </Typography>
        <DownArrowIcon fontSize="small" />
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
          {sheetIds.map((id, index) => (
            <ListItem
              key={id}
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="comments"
                  onClick={() => {
                    const isOk = confirm("Are you sure?")
                    isOk && googleSheetsManager.remove(id)
                  }}>
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding>
              <ListItemButton
                onClick={() => {
                  googleSheetsManager.switchTo(id)
                  setAnchorEl(null)
                }}>
                <ListItemIcon>
                  <Radio
                    color="success"
                    edge="start"
                    checked={workSheet?.spreadsheetId === id}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={index}
                  secondary={id}
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
