import { RouterProvider, createMemoryRouter } from "react-router-dom"

import { Config } from "./Config"
import { AuthLoader } from "./Loader/auth.loader"
import { Login } from "./Login"
import { SheetsManagement } from "./SheetsManagement"

export const router = createMemoryRouter([
  {
    path: "/",
    element: <SheetsManagement />,
    loader: AuthLoader("/")
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/config",
    element: <Config />
  }
])

export const Routing = () => {
  return <RouterProvider router={router} />
}
