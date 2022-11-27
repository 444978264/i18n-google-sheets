import {Button, IconButton, Stack, SvgIcon, TextField} from "@mui/material"
import {useState} from "react"
import {createRoot} from "react-dom/client"

const FontPicker = () => {
  const [inspecting, setInspecting] = useState(false)
  return (
    <>
      <Stack direction="row" spacing={1}>
        <IconButton
          title="Select an text element in the page to inspect it"
          color={inspecting ? "primary" : "default"}
          onClick={() => {
            setInspecting((prev) => {
              return !prev
            })
          }}>
          <SvgIcon viewBox="0 0 1024 1024" width="32" height="32">
            <path
              d="M512 876.14c-200.78 0-364.13-163.35-364.13-364.14S311.22 147.86 512 147.86c200.79 0 364.14 163.35 364.14 364.14S712.79 876.14 512 876.14z m0-675.57c-171.72 0-311.42 139.7-311.42 311.43S340.28 823.43 512 823.43c171.73 0 311.43-139.7 311.43-311.43S683.73 200.57 512 200.57z"
              fill="currentColor"></path>
            <path
              d="M512 638.43c-69.71 0-126.42-56.71-126.42-126.43S442.29 385.57 512 385.57c69.72 0 126.43 56.71 126.43 126.43S581.72 638.43 512 638.43z m0-200.16c-40.65 0-73.72 33.07-73.72 73.73s33.07 73.73 73.72 73.73c40.66 0 73.73-33.07 73.73-73.73s-33.07-73.73-73.73-73.73zM512 960c-14.55 0-26.35-11.8-26.35-26.35V768.43c0-14.55 11.8-26.35 26.35-26.35s26.35 11.8 26.35 26.35v165.22c0 14.55-11.8 26.35-26.35 26.35zM512 281.93c-14.55 0-26.35-11.8-26.35-26.35V90.35C485.65 75.8 497.45 64 512 64s26.35 11.8 26.35 26.35v165.22c0 14.56-11.8 26.36-26.35 26.36zM255.57 538.35H90.35C75.8 538.35 64 526.55 64 512s11.8-26.35 26.35-26.35h165.22c14.55 0 26.35 11.8 26.35 26.35 0.01 14.55-11.79 26.35-26.35 26.35zM933.65 538.35H768.43c-14.55 0-26.35-11.8-26.35-26.35s11.8-26.35 26.35-26.35h165.21c14.55 0 26.35 11.8 26.35 26.35 0.01 14.55-11.79 26.35-26.34 26.35z"
              fill="currentColor"></path>
          </SvgIcon>
        </IconButton>
        <TextField size="medium" />
      </Stack>
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
