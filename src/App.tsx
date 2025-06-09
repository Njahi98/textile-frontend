import { useRoutes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { routes } from "./routes"
import { useAuthInit } from "./hooks/use-auth-init";

function App() {
  const routing = useRoutes(routes);

  // Initialize auth state on app load
  useAuthInit();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {routing}
    </ThemeProvider>

  

  )
}

export default App  