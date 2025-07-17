import { useState, useEffect, useContext } from "react";
import { Button, Card, Spinner, Image, Badge } from "react-bootstrap";
import {
  FiSettings,
  FiClock,
  FiThermometer,
  FiEdit2,
  FiUser,
  FiActivity,
  FiList,
  FiArchive
} from "react-icons/fi";
import RunningTextModal from "../../src/components/modals/RunningTextModal";
import ClockModal from "../../src/components/modals/ClockModal";
import TemperatureModal from "../../src/components/modals/TemperatureModal";
import DateModal from "../../src/components/modals/DateModal";
import FeatureUsageCard from "../../src/components/FeatureUsageCard";
import LoginHistoryCard from "../../src/components/LoginHistoryCard";
import { UserContext } from "../../src/contexts/userContext";
import "../../styles/DasboardStyle.css";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

export default function DesktopDashboardLayout() {
  const { user: contextUser, setUser } = useContext(UserContext);
  const [modals, setModals] = useState({
    text: false,
    clock: false,
    temp: false,
    date: false
  });
  const [dashboardData, setDashboardData] = useState({
    featureUsage: [],
    loginHistory: [],
    isLoading: true,
    error: null
  });
  const [userProfile, setUserProfile] = useState({
    data: contextUser || null,
    loading: false,
    error: null
  });

  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const goToLoginHistory = () => navigate("/riwayat-login");
  const goToUsageHistory = () => navigate("/riwayat-usage");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };


  const toggleModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  };

  useEffect(() => {
  console.log("User profile data:", userProfile.data);
}, [userProfile.data]);


  const fetchUserProfile = async () => {
    try {
      setUserProfile(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const result = await response.json();
      setUserProfile({
        data: result.user,
        loading: false,
        error: null
      });
      setUser(result.user); // Update context if needed
    } catch (err) {
      console.error("User profile error:", err);
      setUserProfile(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [featureResponse, loginResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/feature/usage`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
          }),
          fetch(`${API_BASE_URL}/auth/login-history`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
          })
        ]);

        if (!featureResponse.ok || !loginResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [featureResult, loginResult] = await Promise.all([
          featureResponse.json(),
          loginResponse.json()
        ]);

        setDashboardData({
          featureUsage: featureResult.data || [],
          loginHistory: loginResult.data || [],
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error("Dashboard data error:", err);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: err.message
        }));
      }
    };

    fetchDashboardData();
    fetchUserProfile(); // Fetch user profile on component mount
  }, [token]);

  const formatUserName = (user) => {
    if (!user) return "Pengguna";
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ID: ${user.id}`;
  };

  const getProfilePicture = (user) => {
    return user?.profile_picture_url || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=E2E8F0&color=475569`;
  };


  return (
    <div className="dashboard-grid">
      {/* Sidebar Section */}
      <aside className="dashboard-sidebar">
        <header className="sidebar-header">
          <FiSettings size={20} className="sidebar-icon" />
          <h5 className="sidebar-title">Menu Fitur</h5>
        </header>

        <div className="user-profile">
          {userProfile.loading ? (
            <div className="profile-loading">
              <Spinner animation="border" size="sm" />
            </div>
          ) : userProfile.error ? (
            <Alert variant="danger" className="profile-error">
              Gagal memuat profil
            </Alert>
          ) : (
            <>
              <Image
                src={getProfilePicture(userProfile.data)}
                roundedCircle
                className="profile-avatar"
                alt="User profile"
                width={80}
                height={80}
              />
              <h4 className="user-name">{formatUserName(userProfile.data)}</h4>
              <Badge 
                pill 
                bg={userProfile.data?.role === "Aktif" ? "success" : "secondary"}
                className="user-status"
              >
                {userProfile.data?.role || "Tidak diketahui"}
              </Badge>
            </>
          )}
        </div>

        <nav className="sidebar-navigation">
          <Button 
            variant="light" 
            className="nav-item"
            onClick={() => toggleModal("text")}
          >
            <FiEdit2 className="nav-icon" />
            <span>Running Text</span>
          </Button>
          <Button 
            variant="light" 
            className="nav-item"
            onClick={() => toggleModal("clock")}
          >
            <FiClock className="nav-icon" />
            <span>Pengaturan Jam</span>
          </Button>
          <Button 
            variant="light" 
            className="nav-item"
            onClick={() => toggleModal("temp")}
          >
            <FiThermometer className="nav-icon" />
            <span>Pengaturan Suhu</span>
          </Button>
          <Button 
            variant="light" 
            className="nav-item"
            onClick={() => toggleModal("date")}
          >
            <FiThermometer className="nav-icon" />
            <span>Pengaturan Tanggal</span>
          </Button>
          <Button 
            variant="light" 
            className="nav-item"
            onClick={goToLoginHistory}
          >
            <FiList className="nav-icon" />
            <span>Riwayat Login</span>
          </Button>
          <Button 
            variant="light" 
            className="nav-item"
            onClick={goToUsageHistory}
          >
            <FiArchive className="nav-icon" />
            <span>Riwayat Penggunaan</span>
          </Button>
          <Button 
            variant="danger" 
            className="nav-item logout-button"
            onClick={handleLogout}
          >
            <FiLogOut className="nav-icon" />
            <span>Logout</span>
          </Button>
        </nav>
      </aside>

      {/* Main Content Section */}
      <main className="dashboard-main">
        <header className="main-header">
          <h1 className="main-title">
            <FiActivity className="title-icon" />
            Dashboard Desktop
          </h1>
          <div className="header-divider" />
        </header>

        {/* Login History Section */}
        <section className="login-history-section">
          <h2 className="section-title">
            <FiUser className="section-icon" />
            Riwayat Login Terakhir
          </h2>
          <div className="history-scroller">
            {dashboardData.loginHistory.length > 0 ? (
              dashboardData.loginHistory.map((history, index) => (
                <LoginHistoryCard
                  key={`login-history-${index}`}
                  photo={history.photo}
                  name={history.name}
                  userId={history.userId}
                  status={history.status}
                />
              ))
            ) : (
              <p className="empty-message">Tidak ada riwayat login</p>
            )}
          </div>
        </section>

        {/* Feature Usage Section */}
      <section className="feature-usage-section">
        <Card className="shadow-sm feature-usage-card">
          <Card.Header className="card-header">
            <h2 className="section-title">
              <FiActivity className="section-icon" />
              Aktivitas Fitur Terakhir
            </h2>
          </Card.Header>
          <Card.Body className="card-body feature-scroll-container">
            {dashboardData.isLoading ? (
              <div className="loading-state">
                <Spinner animation="border" variant="primary" />
                <span>Memuat data aktivitas...</span>
              </div>
            ) : dashboardData.error ? (
              <div className="error-state">
                <p>Gagal memuat data: {dashboardData.error}</p>
              </div>
            ) : dashboardData.featureUsage.length === 0 ? (
              <p className="empty-message">Belum ada aktivitas fitur</p>
            ) : (
              <div className="feature-list-container">
                <div className="feature-list">
                  {dashboardData.featureUsage.map((item, index) => (
                    <FeatureUsageCard
                      key={`feature-usage-${index}`}
                      name={item.name === "undefined undefined" 
                        ? `User ID: ${item.user_id}` 
                        : item.name}
                      feature={item.feature}
                      change={item.change_text}
                      datetime={new Date(item.datetime).toLocaleString()}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </section>
      </main>

      {/* Modals */}
      <RunningTextModal 
        show={modals.text} 
        onClose={() => toggleModal("text")} 
      />
      <ClockModal 
        show={modals.clock} 
        onClose={() => toggleModal("clock")} 
      />
      <TemperatureModal 
        show={modals.temp} 
        onClose={() => toggleModal("temp")} 
      />
      <DateModal 
      show={modals.date}
      onClose={() => toggleModal("date")}
      />
    </div>
  );
}