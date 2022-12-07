import { IconButton, Menu, MenuItem } from "@mui/material"
import { MouseEvent, useState } from "react"
import { arrayBuffer } from "stream/consumers"

import { googleSheetsManager } from "~lib/google-sheets"

import { useWorkSheets } from "./GoogleSheetsProvider"
import { DownLoadIcon } from "./icons/DownloadIcon"

export function DownloadButton({ id, title }: { id: string; title: string }) {
  const workSheet = useWorkSheets()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const download = (type: "csv" | "tsv" | "pdf") => {
    return () => {
      if (workSheet) {
        workSheet._downloadAs(type, id).then((arrayBuffer) => {
          googleSheetsManager.download(arrayBuffer, `${title}.${type}`)
        })
        handleClose()
      }
    }
  }

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <DownLoadIcon fontSize="small" viewBox="0 0 24 24" />
      </IconButton>
      <Menu
        MenuListProps={{ dense: true }}
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}>
        <MenuItem onClick={download("csv")}>.csv</MenuItem>
        <MenuItem onClick={download("tsv")}>.tsv</MenuItem>
        <MenuItem onClick={download("pdf")}>.pdf</MenuItem>
      </Menu>
    </>
  )
}
