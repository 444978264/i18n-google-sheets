import { RouteObject, json, redirect } from "react-router-dom"

import { googleSheetsManager } from "~lib/google-sheets"

export const AuthLoader: (referrer?: string) => RouteObject["loader"] =
  (referrer) => async () => {
    const token = await googleSheetsManager.storage.get("token")

    if (!token) {
      throw redirect(`/login?referrer=${referrer}`)
    }

    return json({ token })
  }
