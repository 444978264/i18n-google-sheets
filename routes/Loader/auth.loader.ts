import { RouteObject, json, redirect } from "react-router-dom"

import { getAuthToken } from "~lib/utils"

export const AuthLoader: (referrer?: string) => RouteObject["loader"] =
  (referrer) => async () => {
    const [token, err] = await getAuthToken()
    if (err) {
      console.log(err, "error[auth]")
      throw redirect(`/login?referrer=${referrer}`)
    }
    console.log(token, "token")
    return json({ token })
  }
