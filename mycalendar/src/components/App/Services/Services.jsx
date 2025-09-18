import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import services from "../../../assets/services.JPEG";
import "./Services.css";

export default function Services() {
    return (
        <div className="App">
            <Nav />
            <div className="services" id ="services">
                <h1>Our Services</h1>
                <p>Explore the variety of services we offer to cater to your needs.</p>
                <img src={services} alt="services" className="services" />
            </div>
            <Footer />
        </div>
    );
}