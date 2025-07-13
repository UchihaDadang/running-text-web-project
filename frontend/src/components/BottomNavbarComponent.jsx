import { House, ClockHistory, ListCheck, PersonCircle } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "../../styles/BottomNav.css";

export default function BottomNavbarComponent({ onProfile, onHome }) {

  return (
    <div className="fixed-bottom bg-white shadow-lg border-top d-flex justify-content-around py-2" style={{ zIndex: 1040 }}>
      <div className="text-center nav-icon" onClick={onHome}>
        <House size={24} />
        <div style={{ fontSize: "0.75rem" }}>Home</div>
      </div>

      <Link to="/riwayat-login" className="text-center text-dark text-decoration-none nav-icon">
        <ClockHistory size={24} />
        <div style={{ fontSize: "0.75rem" }}>Login</div>
      </Link>

      <Link to="/riwayat-usage" className="text-center text-dark text-decoration-none nav-icon">
        <ListCheck size={24} />
        <div style={{ fontSize: "0.75rem" }}>Fitur</div>
      </Link>

      <div className="text-center nav-icon" onClick={onProfile}>
        <PersonCircle size={24} />
        <div style={{ fontSize: "0.75rem" }}>Profil</div>
      </div>
    </div>
  );
}
