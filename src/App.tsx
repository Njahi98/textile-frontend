import { useRoutes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { routes } from "./routes"

function App() {
  const routing = useRoutes(routes)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {routing}
    </ThemeProvider>

  

  )
}

export default App  