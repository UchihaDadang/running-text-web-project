import { BoxArrowRight } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="fixed-top w-100" style={{ zIndex: 1040 }}>
      <div
        className="d-flex justify-content-between align-items-center p-3"
        style={{ backgroundColor: "#007bff" }}
      >
        <h2 className="mb-0" style={{ color: '#fff' }}>LOGO</h2>
        <BoxArrowRight
          size={25}
          color="#fff"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}
