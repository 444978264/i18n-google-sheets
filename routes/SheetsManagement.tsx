import {
  Box,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Tooltip
} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import { useEffect, useMemo, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"

import { AddSheetButton } from "~components/AddSheetButton"
import { DownloadButton } from "~components/DownloadButton"
import { useWorkSheets } from "~components/GoogleSheetsProvider"
import { SkeletonProvider, TextSkeleton } from "~components/Skeleton"
import { CircleIcon } from "~components/icons/CircleIcon"
import { OpenNewIcon } from "~components/icons/OpenNewIcon"
import {
  GoogleSpreadsheetWorksheet,
  googleSheetsManager
} from "~lib/google-sheets"

export function SheetsManagement() {
  const workSheet = useWorkSheets()
  const [loading, setLoading] = useState(true)
  const [sheetInfo, setSheetInfo] = useState<{
    title: string
    sheets: Record<string, GoogleSpreadsheetWorksheet>
  }>({
    title: "",
    sheets: {}
  })
  useEffect(() => {
    return googleSheetsManager.onLoad(() => {
      console.log("loading...", "workSheets")
      // setLoading(true)
      return (doc) => {
        console.log("complete...", "workSheets")
        unstable_batchedUpdates(() => {
          setLoading(false)
          setSheetInfo({
            title: doc.title,
            sheets: doc.sheetsByIndex
          })
        })
      }
    })
  }, [])

  const sheets = useMemo(() => {
    return Object.values(sheetInfo.sheets)
  }, [sheetInfo.sheets])

  console.log(sheetInfo, "sheetInfo")

  return (
    <>
      <SkeletonProvider loading={loading}>
        <TextSkeleton component="h1">
          <Box>{sheetInfo.title}</Box>
          <Chip
            icon={<CircleIcon fontSize="small" />}
            label={"未监测到页面"}
            size="small"
          />
          <Tooltip title="View source for this sheet">
            <IconButton
              sx={{ ml: 1 }}
              size="small"
              color="inherit"
              target="_blank"
              href={
                workSheet ? workSheet._spreadsheetUrl : "javascript:void 0"
              }>
              <OpenNewIcon fontSize="inherit" color="inherit" />
            </IconButton>
          </Tooltip>
        </TextSkeleton>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <Grid2 container spacing={2}>
            {sheets.map((sheet) => {
              return (
                <Grid2
                  key={sheet.sheetId}
                  textAlign="center"
                  xs={4}
                  position="relative"
                  borderRadius={2}
                  sx={{
                    cursor: "pointer",
                    transition: "all .15s",
                    ".download-button": {
                      display: "none"
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                      ".download-button": {
                        display: "block"
                      }
                    }
                  }}>
                  <svg viewBox="0 0 1024 1024" width="64" height="64">
                    <path
                      d="M603.733333 654.933333h-106.666666v32.426667h106.666666z m0-118.186666h-106.666666v37.546666h106.666666z m0 59.733333h-106.666666v35.413333h106.666666z m0-203.093333a64 64 0 0 1-64-63.573334v-145.066666H314.88a37.546667 37.546667 0 0 0-37.546667 37.546666v577.706667a37.546667 37.546667 0 0 0 37.546667 37.546667h394.24a37.546667 37.546667 0 0 0 37.546667-37.546667V393.813333z m28.16 324.266666H389.973333v-213.333333h244.053334z m-28.16-349.866666h140.8L640 260.266667l-72.533333-74.24v145.066666a37.546667 37.546667 0 0 0 38.4 37.546667z m-139.093333 287.146666H420.266667v32.426667h46.933333z m0-118.186666H420.266667v37.546666h46.933333z m0 59.733333H420.266667v35.413333h46.933333z"
                      p-id="11252"
                      fill="#34a853"
                    />
                  </svg>
                  <Box textAlign="center" fontSize={12}>
                    {sheet.title}
                  </Box>
                  <Box
                    className="download-button"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8
                    }}>
                    <DownloadButton id={sheet.sheetId} title={sheet.title} />
                  </Box>
                </Grid2>
              )
            })}
          </Grid2>
        )}
      </SkeletonProvider>
      <AddSheetButton />
    </>
  )
}
