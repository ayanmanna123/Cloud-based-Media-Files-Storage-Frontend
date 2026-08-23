import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Navbar } from "./layouts/Navbar"
import { Login } from "./pages/Auth/Login"
import { Register } from "./pages/Auth/Register"
import { VerifyEmail } from "./pages/Auth/VerifyEmail"
import { ForgotPassword } from "./pages/Auth/ForgotPassword"
import { ResetPassword } from "./pages/Auth/ResetPassword"

// Temporary Placeholder Home Page
const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4 text-center">
    <h1 className="text-4xl font-bold tracking-tight">Cloud Media Storage</h1>
    <p className="text-muted-foreground max-w-lg">
      Securely store, share, and manage your media files in the cloud.
    </p>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
