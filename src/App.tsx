import { Route, Routes } from "react-router-dom"
import { LoginForm } from "@/features/auth/components/Login-form"
import AuthLayout from "./features/auth/pages/AuthLayout"
import { RegisterForm } from "./features/auth/components/Register-form"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "./components/navbar"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Navbar/>
  <Routes>
      <Route path="/" element={""} />
      <Route path="auth" element={<AuthLayout/>}>
      <Route path="login" element={ <LoginForm /> } />
      <Route path="register" element={ <RegisterForm /> } />

      </Route>


    </Routes>

    </ThemeProvider>

  

  )
}

export default App  