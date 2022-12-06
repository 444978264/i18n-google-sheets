import { GoogleSheetsProvider } from "~components/GoogleSheetsProvider"
import { Routing } from "~routes"

function IndexPopup() {
  return (
    <GoogleSheetsProvider>
      <Routing />
    </GoogleSheetsProvider>
  )
}

export default IndexPopup
