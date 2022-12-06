import { IconButton, List, ListItem, ListItemText } from "@mui/material"
import { useEffect, useState } from "react"

import { DeleteIcon } from "~components/icons/DeleteIcon"
import { WifiIcon } from "~components/icons/WifiIcon"
import { googleSheetsManager } from "~lib/google-sheets"

function encodeStr(str: String) {
  return `${str.substr(0, 5)}...${str.substr(-4)}`
}

export function SheetsManagement() {
  const [sheetIds, setSheetIds] = useState(googleSheetsManager.getSheetIds())
  console.log(sheetIds, "sheetIds")

  useEffect(() => {
    chrome.identity.getProfileUserInfo((info) => {
      console.log(info, "getProfileUserInfo")
    })
  }, [])

  useEffect(() => {
    const sub = googleSheetsManager.sheets.subscribe(({ value }) => {
      setSheetIds(value)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <>
      <List>
        {sheetIds.map((d, i) => {
          return (
            <ListItem
              key={d}
              secondaryAction={
                <>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      const isOk = confirm("Are you sure?")
                      isOk && googleSheetsManager.remove(d)
                    }}>
                    <WifiIcon color="success" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => {
                      const isOk = confirm("Are you sure?")
                      isOk && googleSheetsManager.remove(d)
                    }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }>
              <ListItemText primary={i} secondary={encodeStr(d)} />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}
