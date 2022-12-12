import { Fab } from "@mui/material"

import { AddIcon } from "~components/icons/AddIcon"

const CustomButton = () => {
  console.log(
    document.querySelector('[data-styled="active"]'),
    document,
    "document"
  )
  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </>
  )
}

export default CustomButton
