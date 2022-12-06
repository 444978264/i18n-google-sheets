import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem
} from "@mui/material"
import { MouseEvent, useEffect, useState } from "react"

import { clearAllCachedAuthTokens, getProfileUserInfo } from "~lib/utils"

import { LogoutIcon } from "./icons/LogoutIcon"
import { MoreIcon } from "./icons/MoreIcon"
import { SettingIcon } from "./icons/SettingIcon"

export function SettingButton({ token }: { token: string }) {
  const [info, setInfo] = useState<chrome.identity.UserInfo>()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    getProfileUserInfo().then(setInfo)
  }, [])

  return (
    <>
      <IconButton
        size="small"
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}>
        <Avatar sx={{ width: 32, height: 32 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem disabled>{info?.email}</MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <SettingIcon fontSize="small" />
          </ListItemIcon>
          Setting
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <MoreIcon fontSize="small" />
          </ListItemIcon>
          More
        </MenuItem>
        <MenuItem
          onClick={() => {
            clearAllCachedAuthTokens().then(() => {
              console.log("logout")
            })
          }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
