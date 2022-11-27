import { Box, Button } from "@mui/material"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useStorage } from "@plasmohq/storage/hook"

import { googleSheetsManager } from "~lib/google-sheets"

export function Login() {
  const [token, setToken, { setRenderValue, setStoreValue, remove }] =
    useStorage<string>("token")
  const nav = useNavigate()

  useEffect(() => {
    // googleSheetsManager.add("1a_jrIy5sw3UoxgJBdP4MLNTcUDHpgwoj0-9BJV1dk0M")
    // googleSheetsManager.add(
    //   "1SHX6m9BV60RoCcuZV0dQ12zcqdw6w5RWwrqovFp6iB0-9BJV1dk0M"
    // )

    chrome.identity.getProfileUserInfo((info) => {
      console.log(info, "info")
    })
  }, [])

  useEffect(() => {
    if (token) {
      googleSheetsManager.useRawAccessToken(token, (resolve) => {
        chrome.identity.removeCachedAuthToken(
          {
            token
          },
          () => {
            remove()
            resolve()
            console.log("removeCachedAuthToken", "successful")
          }
        )
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
              setStoreValue(token).then(() => {
                setToken(token)
                console.log(token, "token")
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
                remove()
                console.log("removeCachedAuthToken", "successful")
              }
            )
        }}>
        disconnect
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          nav("/management")
        }}>
        go
      </Button>
    </div>
  )
}
