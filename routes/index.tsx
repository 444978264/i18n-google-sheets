import { RouterProvider, createMemoryRouter } from "react-router-dom"

import Layout from "~components/Layout"

import { Config } from "./Config"
import { AuthLoader } from "./Loader/auth.loader"
import { Login } from "./Login"
import { SheetsManagement } from "./SheetsManagement"

export const router = createMemoryRouter([
  {
    path: "/",
    loader: AuthLoader("/"),
    element: <Layout />,
    children: [
      {
        index: true,
        element: <SheetsManagement />
      },
      {
        path: "config",
        element: <Config />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  }
])

export const Routing = () => {
  return <RouterProvider router={router} />
}
