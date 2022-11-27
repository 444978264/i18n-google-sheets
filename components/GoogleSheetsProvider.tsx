import { PropsWithChildren, createContext, useEffect, useState } from "react"

import { GoogleSpreadsheet, googleSheetsManager } from "~lib/google-sheets"

const GoogleSheetsContext = createContext<GoogleSpreadsheet | undefined>(
  googleSheetsManager.workGoogleSpreadsSheet
)

export function GoogleSheetsProvider({ children }: PropsWithChildren<any>) {
  const [sheet, setSheet] = useState<GoogleSpreadsheet | undefined>(
    googleSheetsManager.workGoogleSpreadsSheet
  )

  useEffect(() => {
    const sub = googleSheetsManager.workSheets.subscribe(({ value }) => {
      setSheet(value)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <GoogleSheetsContext.Provider value={sheet}>
      {children}
    </GoogleSheetsContext.Provider>
  )
}
