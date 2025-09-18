import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import "./Nav.css";

export default function Nav() {
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <nav className="nav">
      <section className="nav-bar">
        <div className="logo">Lucy Nailed It</div>
        <ul className="nav-links">
          {/* About */}
          <li>
            {onHome ? (
              <HashLink smooth to="#about">About</HashLink>
            ) : (
              <HashLink smooth to="/#about">About</HashLink>
            )}
          </li>

          {/* Services (always standalone) */}
          <li>
            <Link to="/services">Services</Link>
          </li>

          {/* Gallery */}
          <li>
            {onHome ? (
              <HashLink smooth to="#gallery">Gallery</HashLink>
            ) : (
              <HashLink smooth to="/#gallery">Gallery</HashLink>
            )}
          </li>

          {/* Contact (footer section) */}
          <li>
            {onHome ? (
              <HashLink smooth to="#footer">Contact</HashLink>
            ) : (
              <HashLink smooth to="/#footer">Contact</HashLink>
            )}
          </li>
        </ul>
      </section>
    </nav>
  );
}
