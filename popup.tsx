import { Box, CssBaseline } from "@mui/material"

import { GoogleSheetsProvider } from "~components/GoogleSheetsProvider"
import { Routing } from "~routes"

function IndexPopup() {
  return (
    <GoogleSheetsProvider>
      <CssBaseline />
      <Box width={375} height={600} overflow="auto">
        <Routing />
      </Box>
    </GoogleSheetsProvider>
  )
}

export default IndexPopup
