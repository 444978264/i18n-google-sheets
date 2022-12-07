import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  useScrollTrigger
} from "@mui/material"
import React, { useLayoutEffect } from "react"
import { Outlet, useLoaderData } from "react-router-dom"

import { AUTH_MODES, googleSheetsManager } from "~lib/google-sheets"
import { getAuthToken, refreshAuthToken } from "~lib/utils"

import { SettingButton } from "./SettingButton"
import { SheetsSelector } from "./SheetsSelector"

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window
  children: React.ReactElement
}

function ElevationScroll(props: Props) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined
  })

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0
  })
}

export default function Layout() {
  const { token } = useLoaderData() as { token: string }

  useLayoutEffect(() => {
    googleSheetsManager.getAuthMode().then((mode) => {
      if (mode === AUTH_MODES.OAUTH) {
        googleSheetsManager.useOAuth2({
          getAuthToken,
          refreshAuthToken
        })
      }
    })
  }, [])

  return (
    <>
      <ElevationScroll>
        <AppBar color="default">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="div">
              I18N
            </Typography>
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)"
              }}>
              <SheetsSelector />
            </Box>
            <SettingButton token={token} />
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Container>
        <Outlet />
      </Container>
    </>
  )
}
