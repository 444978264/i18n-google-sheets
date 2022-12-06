import { Button } from "@mui/material"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useStorage } from "@plasmohq/storage/hook"

import { googleSheetsManager } from "~lib/google-sheets"
import {
  getAuthToken,
  getAuthTokenInteractive,
  refreshAuthToken,
  removeCachedAuthToken
} from "~lib/utils"

export function Login() {
  const [urlParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [token, setToken, { setRenderValue, setStoreValue, remove }] =
    useStorage<string>("token")
  const nav = useNavigate()

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <Button
        disabled={loading}
        variant="contained"
        onClick={() => {
          setLoading(true)
          getAuthTokenInteractive().then(([token, err]) => {
            setLoading(false)
            if (err) return
            googleSheetsManager.useOAuth2({
              getAuthToken,
              refreshAuthToken
            })
            setStoreValue(token).then(() => {
              setToken(token)
              const referrer = urlParams.get("referrer") || "/"
              console.log(token, "token")
              nav(referrer)
            })
          })
        }}>
        connect
      </Button>
      <Button
        disabled={loading}
        variant="contained"
        onClick={() => {
          token && removeCachedAuthToken(token).then(remove)
        }}>
        disconnect
      </Button>

      <Button
        disabled={loading}
        variant="contained"
        onClick={() => {
          nav("/")
        }}>
        go
      </Button>
    </div>
  )
}
