import { Button } from "@mui/material"
import { createRoot } from "react-dom/client"

const FontPicker = () => {
  return (
    <>
      <Button
        onClick={() => {
          chrome.identity.getAuthToken({ interactive: true }, function (token) {
            console.log(token, "getAuthToken")
            // chrome.identity.removeCachedAuthToken({ token }, () => {
            //   console.log(token, "removeCachedAuthToken")
            // })
          })
        }}>
        Font Picker
      </Button>
      <p>HELLO WORLD</p>
    </>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(<FontPicker />)
