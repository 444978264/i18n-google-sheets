import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  SvgIcon
} from "@mui/material"
import { useEffect, useState } from "react"

import { googleSheetsManager } from "~lib/google-sheets"

export function SheetsManagement() {
  const [sheetIds, setSheetIds] = useState(googleSheetsManager.getSheetIds())
  console.log(sheetIds, "sheetIds")

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
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {
                    const isOk = confirm("Are you sure?")
                    isOk && googleSheetsManager.remove(d)
                  }}>
                  <SvgIcon width="32" height="32" viewBox="0 0 1024 1024">
                    <path
                      d="M214.3 860.4c0 55 44.6 99.6 99.6 99.6H712c55 0 99.6-44.5 99.6-99.6V263.1H214.3v597.3z m647.1-746.7H687.2l-49.8-49.8H388.5l-49.8 49.8H164.5v99.6h696.9v-99.6z m0 0"
                      p-id="9033"></path>
                  </SvgIcon>
                </IconButton>
              }>
              <ListItemText primary={i} secondary={d} />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}
