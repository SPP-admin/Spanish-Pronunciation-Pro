import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"

const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "/"
const routerBasename = base === "/" ? undefined : base

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={routerBasename}>
    <App />
  </BrowserRouter>,
)
