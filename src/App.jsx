import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import { Navbar } from "./layouts/Navbar"
import { Login } from "./pages/Auth/Login"
import { Register } from "./pages/Auth/Register"
import { VerifyEmail } from "./pages/Auth/VerifyEmail"
import { ForgotPassword } from "./pages/Auth/ForgotPassword"
import { ResetPassword } from "./pages/Auth/ResetPassword"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { Dashboard } from "./pages/Dashboard/Dashboard"
import { PublicShare } from "./pages/PublicShare"

import { Home } from "./pages/Home"
const PublicLayout = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Public Share Route (No Navbar, No Auth) */}
        <Route path="/share/:token" element={<PublicShare />} />
        <Route path="/share/bundle/:token" element={<PublicShare isBundle={true} />} />

        {/* Dashboard Routes (uses its own layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="folder/:id" element={<Dashboard />} />
            <Route path="recent" element={<Dashboard />} />
            <Route path="starred" element={<Dashboard />} />
            <Route path="shared" element={<Dashboard />} />
            <Route path="trash" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
