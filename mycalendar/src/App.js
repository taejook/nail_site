import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/App/Home/Home";
import Nav from "./components/App/Nav/Nav";
import About from "./components/App/About/About";
import Services from "./components/App/Services/Services";
import Gallery from "./components/App/Gallery/Gallery";
import Footer from "./components/App/Footer/Footer";
import Calendar from "./components/App/Calendar/Calendar";
import BookingSection from "./components/App/Calendar/BookingSection/BookingSection";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Standalone Services page */}
        <Route path="/services" element={<Services />} />
        
        {/* Standalone Gallery page */}
        <Route path="/gallery" element={<Gallery />} />

        {/* Standalone Calendar page */}
        <Route path="/calendar" element={<Calendar />} />

        {/* Standalone About page */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
