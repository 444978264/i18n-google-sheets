import { Box } from "@mui/material"
import { MemoryRouter } from "react-router-dom"

import { GoogleSheetsProvider } from "~components/GoogleSheetsProvider"
import { Routing } from "~routes"

function IndexPopup() {
  return (
    <Box width={375} sx={{ wordBreak: "break-word" }}>
      <GoogleSheetsProvider>
        <MemoryRouter>
          <Routing />
        </MemoryRouter>
      </GoogleSheetsProvider>
    </Box>
  )
}

export default IndexPopup
