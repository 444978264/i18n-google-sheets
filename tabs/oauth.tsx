import { Box, Button } from "@mui/material"
import { useState } from "react"

export default function OAuth() {
  const [token, setToken] = useState<string>()

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <Box>token: {token}</Box>
      <Button
        variant="contained"
        onClick={() => {
          chrome.identity.getAuthToken(
            { interactive: true },
            async function (token) {
              if (chrome.runtime.lastError || !token) {
                console.error(chrome.runtime.lastError)
                return
              }
              console.log(token, "token")
              setToken(token)
            }
          )
        }}>
        connect
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          token &&
            chrome.identity.removeCachedAuthToken(
              {
                token
              },
              () => {
                console.log("removeCachedAuthToken", "successful")
              }
            )
        }}>
        disconnect
      </Button>
    </div>
  )
}
