import { Button } from "@mui/material"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useStorage } from "@plasmohq/storage/hook"

import { googleSheetsManager } from "~lib/google-sheets"
import {
  getAuthTokenInteractive,
  refreshAuthToken,
  removeCachedAuthToken
} from "~lib/utils"

export function Login() {
  const [urlParams] = useSearchParams()
  const [token, setToken, { setRenderValue, setStoreValue, remove }] =
    useStorage<string>("token")
  const nav = useNavigate()

  useEffect(() => {
    chrome.identity.getProfileUserInfo((info) => {
      console.log(info, "getProfileUserInfo")
    })
  }, [])

  useEffect(() => {
    if (token) {
      googleSheetsManager.useRawAccessToken(token, (resolve) => {
        refreshAuthToken(token).then(() => {
          remove()
          resolve()
          console.log("removeCachedAuthToken", "successful")
        })
      })
      //   doc.loadInfo().then(() => {})
      //   doc.updateProperties({ title: "renamed doc" })
    }
    const listen = (account, signedIn) => {
      console.log(account, signedIn, "account, signedIn")
    }
    chrome.identity.onSignInChanged.addListener(listen)

    return () => {
      chrome.identity.onSignInChanged.removeListener(listen)
    }
  }, [token])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <Button
        variant="contained"
        onClick={() => {
          getAuthTokenInteractive().then(([token, err]) => {
            if (err) return
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
        variant="contained"
        onClick={() => {
          token && removeCachedAuthToken(token).then(remove)
        }}>
        disconnect
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          nav("/")
        }}>
        go
      </Button>
    </div>
  )
}
