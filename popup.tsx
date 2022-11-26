import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { GoogleSpreadsheet } from "~lib/index"

const storage = new Storage()
const doc = new GoogleSpreadsheet(
  "1SHX6m9BV60RoCcuZV0dQ12zcqdw6w5RWwrqovFp6iB0"
)

export default function Popup() {
  const [token, setToken] = useState<string>()

  useEffect(() => {
    storage.get("token").then((token) => {
      setToken(token)
    })
  }, [])

  useEffect(() => {
    if (token) {
      doc.useRawAccessToken(token)
      doc.loadInfo().then((d) => {
        console.log(d, "doc")
      })
    }
  }, [token])

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
              storage.set("token", token).then((val) => {
                setToken(token)
              })
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
                storage.remove("token").then((val) => {
                  setToken(undefined)
                  console.log("removeCachedAuthToken", "successful")
                })
              }
            )
        }}>
        disconnect
      </Button>
    </div>
  )
}
