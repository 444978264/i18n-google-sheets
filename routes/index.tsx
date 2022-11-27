import { Route, Routes } from "react-router-dom"

import { Config } from "./Config"
import { Login } from "./Login"
import { SheetsManagement } from "./SheetsManagement"

export const Routing = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/config" element={<Config />} />
    <Route path="/management" element={<SheetsManagement />} />
  </Routes>
)
