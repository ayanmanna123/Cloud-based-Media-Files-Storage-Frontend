import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import ClickSpark from "./components/ClickSpark"
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
import { GoogleOneTapPrompt } from "./components/GoogleOneTapPrompt"

import { Home } from "./pages/Home"
import { Features } from "./pages/Features"
import { AboutUs } from "./pages/AboutUs"
import { NotFound } from "./pages/NotFound"
import { Footer } from "./layouts/Footer"

const PublicLayout = () => (
  <div className="bg-background text-foreground">
    <Navbar />
    <main className="min-h-[calc(100vh-64px)]">
      <Outlet />
    </main>
    <Footer />
  </div>
)

function App() {
  return (
    <ClickSpark
      sparkColor="#ffffff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <Router>
        <GoogleOneTapPrompt />
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
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
    </ClickSpark>
  )
}

export default App
