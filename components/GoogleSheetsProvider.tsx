import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState
} from "react"

import { GoogleSpreadsheet, googleSheetsManager } from "~lib/google-sheets"

const GoogleSheetsContext = createContext<GoogleSpreadsheet | undefined>(
  googleSheetsManager.workGoogleSpreadsSheet
)

export function useWorkSheets() {
  return useContext(GoogleSheetsContext)
}

export function GoogleSheetsProvider({ children }: PropsWithChildren<any>) {
  const [sheet, setSheet] = useState<GoogleSpreadsheet | undefined>(
    () => googleSheetsManager.workGoogleSpreadsSheet
  )

  useEffect(() => {
    const sub = googleSheetsManager.workSheets.subscribe((value) => {
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
