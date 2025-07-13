import { useEffect, useState } from "react";
import { Card, Image, Col, Row, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AvatarDefault from "../../src/assets/default-avatar.jpg";
import { useUser } from "../contexts/userContext";

export default function UserProfileModal({ refreshTrigger }) {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Anda belum login");
        setIsLoading(false);
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: 'no-store'
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          setError("Sesi telah berakhir. Silakan login kembali.");
          navigate("/");
          return;
        }

        const data = await response.json();
        if (response.ok && data.success) {
          const userWithUrl = {
            ...data.user,
            profile_picture_url: data.user.profile_picture 
              ? `http://localhost:5000/uploads/${data.user.profile_picture}?t=${refreshTrigger || Date.now()}`
              : null
          };
          setUser(userWithUrl);
          console.log("Profile loaded with URL:", userWithUrl.profile_picture_url);
        } else {
          throw new Error(data.message || "Gagal memuat data pengguna.");
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [refreshTrigger, navigate, setUser]);

  if (isLoading) {
    return (
      <Card className="p-3 shadow-sm rounded-4 mx-auto" style={{ width: "350px" }}>
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Memuat...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-3 shadow-sm rounded-4 mx-auto" style={{ width: "350px" }}>
        <Alert variant="danger" className="m-0">
          {error}
          <Button onClick={() => navigate("/")} className="mt-2 btn-sm">
            Login Ulang
          </Button>
        </Alert>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="p-3 shadow-sm rounded-4 mx-auto" style={{ width: "350px" }}>
      <Row className="align-items-center">
        <Col>
          <h5>{user.first_name} {user.last_name}</h5>
          <p className="text-muted mb-1">{user.email}</p>
          <span className={`badge ${
            user.role === 'admin' ? 'bg-danger' :
            user.role === 'dosen' ? 'bg-primary' : 'bg-success'
          }`}>
            {user.role}
          </span>
        </Col>
        <Col xs="auto">
        <Image
            key={user.profile_picture_url}
            src={user.profile_picture_url || AvatarDefault}
            roundedCircle
            width={64}
            height={64}
            className="border"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              console.log("Image failed to load:", e.target.src);
              e.target.onerror = null;
              e.target.src = AvatarDefault;
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", user.profile_picture_url);
            }}
          />
        </Col>
      </Row>
    </Card>
  );
}