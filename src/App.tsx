import { useRoutes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { routes } from "./routes"
import { useAuthInit } from "./hooks/use-auth-init";
import { Toaster } from "sonner";
import { useLanguage } from "./hooks/useLanguage";

function App() {
  const routing = useRoutes(routes);

  // Initialize auth state on app load
  useAuthInit();
  // Ensure html lang/dir reflect current language
  useLanguage();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
       <Toaster position="top-right" toastOptions={{
            style: {
              background: "black", color:"white"
            },
          }}/>
      {routing}
    </ThemeProvider>

  

  )
}

export default App  