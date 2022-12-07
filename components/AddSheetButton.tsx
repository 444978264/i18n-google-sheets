import LoadingButton from "@mui/lab/LoadingButton"
import {
  Box,
  Checkbox,
  Drawer,
  Fab,
  FormControlLabel,
  TextField
} from "@mui/material"
import { useState } from "react"

import { googleSheetsManager } from "~lib/google-sheets"

import { AddIcon } from "./icons/AddIcon"

function AddFormPanel({ success }: { success?(): void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // 1a_jrIy5sw3UoxgJBdP4MLNTcUDHpgwoj0-9BJV1dk0M
    // 1SHX6m9BV60RoCcuZV0dQ12zcqdw6w5RWwrqovFp6iB0-9BJV1dk0M
    id: "",
    default: false
  })

  return (
    <Box px={2} pb={2}>
      <TextField
        value={formData.id}
        onChange={(e) => {
          setFormData((prev) => {
            return {
              ...prev,
              id: e.target.value
            }
          })
        }}
        margin="normal"
        label="New Sheet Id"
        variant="standard"
        fullWidth
      />
      <FormControlLabel
        onChange={(e, checked) => {
          setFormData((prev) => {
            return {
              ...prev,
              default: checked
            }
          })
        }}
        control={<Checkbox size="small" />}
        label="Switch To This Sheet"
      />
      <LoadingButton
        fullWidth
        variant="contained"
        size="large"
        disabled={!formData.id}
        loading={loading}
        onClick={() => {
          setLoading(true)
          googleSheetsManager.add(formData.id).then(() => {
            setLoading(false)
            success?.()
          })
        }}>
        Confirm
      </LoadingButton>
    </Box>
  )
}

export function AddSheetButton() {
  const [state, setState] = useState(false)

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return
    }
    setState((prev) => !prev)
  }

  return (
    <>
      <Fab
        onClick={toggleDrawer}
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
      <Drawer anchor="bottom" open={state} onClose={toggleDrawer}>
        <AddFormPanel
          success={() => {
            setState(false)
          }}
        />
      </Drawer>
    </>
  )
}
