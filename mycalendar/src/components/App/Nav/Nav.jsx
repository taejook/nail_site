import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useAuth } from "../../../context/AuthContext";
import { useModal } from "../../../context/ModalContext";
import "./Nav.css";

export default function Nav() {
  const location = useLocation();
  const onHome = location.pathname === "/";
  const { user, logout } = useAuth();
  const { openAuthModal } = useModal();

  return (
    <nav className="nav">
      <section className="nav-bar">
        <Link to="/">
          <header className="logo">Lucy Nailed It</header>
        </Link>

        <ul className="nav-links">
          <li>
            {onHome ? (
              <HashLink smooth to="#about">
                About
              </HashLink>
            ) : (
              <HashLink smooth to="/#about">
                About
              </HashLink>
            )}
          </li>

          <li>
            <Link to="/services">Services</Link>
          </li>

          <li>
            {onHome ? (
              <HashLink smooth to="#gallery">
                Gallery
              </HashLink>
            ) : (
              <HashLink smooth to="/#gallery">
                Gallery
              </HashLink>
            )}
          </li>

          <li>
            {onHome ? (
              <HashLink smooth to="#footer">
                Contact
              </HashLink>
            ) : (
              <HashLink smooth to="/#footer">
                Contact
              </HashLink>
            )}
          </li>

          {/* Auth section */}
          {user ? (
            <>
              <li className="nav-user">Hi, {user.fullName || user.email}</li>
              <li>
                <button className="nav-btn" onClick={logout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
            <div className="btn-wrapper">
              <li>
                <button
                  className="nav-btn"
                  onClick={() => openAuthModal("login")}
                >
                  Login
                </button>
              </li>
              /
              <li>
                <button
                  className="nav-btn"
                  onClick={() => openAuthModal("register")}
                >
                  Register
                </button>
              </li>
              </div>
            </>
          )}
        </ul>
      </section>
    </nav>
  );
}
