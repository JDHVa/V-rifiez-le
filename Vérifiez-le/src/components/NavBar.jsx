import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>CamionNL</span>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Mapa
        </NavLink>
        <NavLink
          to="/conductor"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Conductor
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Admin
        </NavLink>
        <NavLink to="/qr" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          QR
        </NavLink>
      </div>
    </nav>
  );
}
