import { Route, Routes } from "react-router-dom"
import { LoginForm } from "@/features/auth/components/LoginForm"
import AuthLayout from "@/features/auth/pages/AuthLayout"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { ThemeProvider } from "@/components/theme-provider"
import AppLayout from "@/layouts/AppLayout"
import DashboardLayout from "@/features/dashboard/pages/DashboardLayout";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";

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
        <Route path="dashboard" element={<DashboardLayout/>}>
        <Route index element={<DashboardHome/>}/>
          
        </Route>
      </Routes>
    </ThemeProvider>

  

  )
}

export default App  