import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import Calendar from "../Calendar/Calendar";
import About from "../About/About";
import Gallery from "../Gallery/Gallery";
import "./Home.css";
export default function Home() {
  return (
    <div className="App">
      <Nav />
      <main>
        <About />
        <Gallery />
        <Calendar />
      </main>
      <Footer />
    </div>
  );
}
