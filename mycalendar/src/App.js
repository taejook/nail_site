import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../src/context/AuthContext";
import ProtectedRoute from "../src/components/App/ProtectedRoutes";
import { ModalProvider } from "../src/context/ModalContext";

import Home from "../src/components/App/Home/Home";
import Services from "../src/components/App/Services/Services";
import Gallery from "../src/components/App/Gallery/Gallery";
import Calendar from "../src/components/App/Calendar/Calendar";
import About from "../src/components/App/About/About";

import AuthModal from "../src/components/App/AuthModal/AuthModal"

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <AuthModal />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}
