import { Route, Routes } from "react-router-dom"
import { LoginForm } from "@/features/auth/components/LoginForm"
import AuthLayout from "./features/auth/pages/AuthLayout"
import { RegisterForm } from "./features/auth/components/RegisterForm"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "./features/dashboard/pages/Dashboard"
import AppLayout from "./layouts/AppLayout"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<AppLayout />}>
        <Route path="/" element={<div>hello root</div>} />
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>
        </Route>
        <Route path="dashboard" element={<Dashboard />} />
      </Routes>
    </ThemeProvider>

  

  )
}

export default App  