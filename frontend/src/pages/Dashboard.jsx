import { useEffect, useState } from "react";
import MobileDashboardLayout from "../../layouts/Dashboard/MobileDashboardLayout";
import DesktopDashboardLayout from "../../layouts/Dashboard/DekstopDasboardLayout";

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileDashboardLayout /> : <DesktopDashboardLayout />;
}
