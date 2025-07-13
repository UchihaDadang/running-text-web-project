import { useState, useEffect, useRef } from "react";
import UserProfileModal from "../../src/components/UserProfilModal";
import EditTextIcon from "../../src/assets/edit-text.png";
import EditTemperatureIcon from "../../src/assets/thermometer1.png";
import EditDateIcon from "../../src/assets/calendar.png";
import EditTimeIcon from "../../src/assets/clock.png";
import FeatureButton from "../../src/components/FeatureButton";
import LoginHistoryCard from "../../src/components/LoginHistoryCard";
import FeatureUsageCard from "../../src/components/FeatureUsageCard";
import { useNavigate, Link } from "react-router-dom";
import ProfilModalComponent from "../../src/components/modals/ProfileModalComponent";
import TopNavbar from "../../src/components/TopNavbar";
import BottomNavbarComponent from "../../src/components/BottomNavbarComponent";
import ClockModal from "../../src/components/modals/ClockModal";
import RunningTextModal from "../../src/components/modals/RunningTextModal";
import TemperatureModal from "../../src/components/modals/TemperatureModal";
import DateModal from "../../src/components/modals/DateModal";
import { useLoginHistory } from "../../src/contexts/LoginHistoryContext";

export default function MobileDashboardLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [showRunningTextModal, setShowRunningTextModal] = useState(false);
  const [showTemperatureModal, setShowTemperatureModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const token = localStorage.getItem("token");
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { loginHistory, fetchLoginHistory } = useLoginHistory();

  const [featureUsage, setFeatureUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleProfileUpdate = () => {
    setRefreshKey(prev => prev + 1);
    fetchLoginHistory();
    console.log("Profile updated, refreshing with key:", Date.now());
  };

  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      console.log("Scroll to top inside div");
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

useEffect(() => {
  let intervalId;

  const fetchFeatureUsage = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/feature/usage", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Gagal mengambil data riwayat fitur");

      const result = await response.json();

      if (JSON.stringify(result.data) !== JSON.stringify(featureUsage)) {
        setFeatureUsage(result.data || []);
      }

      setLoading(false);
      console.log("Polling update:", new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching feature usage:", err);
      setLoading(false);
    }
  };

  fetchFeatureUsage();
  intervalId = setInterval(fetchFeatureUsage, 5000); // <= 5 detik

  return () => clearInterval(intervalId);
}, [token, featureUsage]);

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
      <TopNavbar />
      <div className="flex-grow-1 overflow-auto" ref={scrollRef}>
        <div 
          className="position-relative" 
          style={{ 
            height: '15rem', 
            background: 'linear-gradient(to bottom, #007bff, #007bff 60%, rgba(255,255,255,0) 100%)' 
          }}
        >
          <div 
            className="position-absolute w-100 d-flex justify-content-center"
            style={{
              top: '15rem',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}
          >
            {token && <UserProfileModal key={refreshKey} refreshTrigger={refreshKey} />}
          </div>
        </div>

        <div className="px-3 bg-body mt-2">
          {/* Fitur Buttons */}
          <div className="d-flex justify-content-center flex-row" style={{ cursor: 'pointer' }}>
            <FeatureButton icon={EditTextIcon} label="Edit Teks" onClick={() => setShowRunningTextModal(true)} />
            <FeatureButton icon={EditTemperatureIcon} label="Edit Suhu" onClick={() => setShowTemperatureModal(true)} />
            <FeatureButton icon={EditDateIcon} label="Edit Tanggal" onClick={() => setShowDateModal(true)} />
            <FeatureButton icon={EditTimeIcon} label="Custom Waktu" onClick={() => setShowClockModal(true)} />
          </div>

          {/* Riwayat Login */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h5 className="mt-0">Riwayat Login</h5>
            <Link to="/riwayat-login" className="text-primary text-decoration-none" style={{ fontSize: '0.9rem' }}>
              Lihat Semua
            </Link>
          </div>
          <div className="d-flex flex-row flex-nowrap overflow-auto pb-3">
            {loginHistory.map((user, index) => (
              <LoginHistoryCard
                key={index}
                photo={user.photo}
                name={user.name}
                userId={user.userId}
                status={user.status}
              />
            ))}
          </div>

          {/* Riwayat Penggunaan Fitur */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h5 className="mb-0 mt-3">Riwayat Penggunaan Fitur</h5>
            <Link to="/riwayat-usage" className="text-primary text-decoration-none" style={{ fontSize: '0.9rem' }}>
              Lihat Semua
            </Link>
          </div>
          <div className="mt-2 pb-4 overflow-auto" style={{ maxHeight: '500px' }}>
            {loading ? (
              <p>Mengambil data...</p>
            ) : featureUsage.length === 0 ? (
              <p>Tidak ada riwayat penggunaan fitur.</p>
            ) : (
              featureUsage.map((item, idx) => (
                <FeatureUsageCard
                  key={idx}
                  name={item.name}
                  feature={item.feature}
                  change={item.change_text}
                  datetime={new Date(item.datetime).toLocaleString()}
                />
              ))
            )}
          </div>
        </div>

        <BottomNavbarComponent
          onHome={scrollToTop}
          onLogin={() => navigate("/riwayat-login")}
          onFeature={() => {}}
          onProfile={() => setShowProfile(true)}
        />

        <ProfilModalComponent 
          show={showProfile} 
          onClose={() => setShowProfile(false)}
          onProfileUpdate={handleProfileUpdate}
        />
        <ClockModal show={showClockModal} onClose={() => setShowClockModal(false)} />
        <RunningTextModal show={showRunningTextModal} onClose={() => setShowRunningTextModal(false)} />
        <TemperatureModal show={showTemperatureModal} onClose={() => setShowTemperatureModal(false)} />
        <DateModal show={showDateModal} onClose={() => setShowDateModal(false)} />
      </div>
    </div>
  );
}