import { Box } from "@mui/material"

import { GoogleSheetsProvider } from "~components/GoogleSheetsProvider"
import { Routing } from "~routes"

function IndexPopup() {
  return (
    <Box width={375} sx={{ wordBreak: "break-word" }}>
      <GoogleSheetsProvider>
        <Routing />
      </GoogleSheetsProvider>
    </Box>
  )
}

export default IndexPopup
