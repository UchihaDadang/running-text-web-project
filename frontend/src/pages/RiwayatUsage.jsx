import { useEffect, useState } from "react";
import { Container, Button, Form, Card as BsCard } from "react-bootstrap";
import { ArrowLeft, TrashFill } from "react-bootstrap-icons";
import FeatureUsageCard from "../components/FeatureUsageCard";

export default function RiwayatUsagePage() {
  const [historyList, setHistoryList] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchUsageHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/feature/usage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal fetch");

      const result = await response.json();
      setHistoryList(result.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    }
  };

  useEffect(() => {
    fetchUsageHistory();
  }, []);

  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/feature-usage/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal hapus item");

      fetchUsageHistory();
    } catch (err) {
      console.error("Gagal hapus data:", err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/feature-usage`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal hapus semua");

      fetchUsageHistory();
    } catch (err) {
      console.error("Gagal hapus semua riwayat:", err);
    }
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const sortedList = [...historyList].sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.datetime) - new Date(b.datetime)
      : new Date(b.datetime) - new Date(a.datetime)
  );

  return (
    <Container className="py-4">
      <BsCard className="p-4 shadow-sm rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Riwayat Penggunaan</h3>
          <Button variant="outline-secondary" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft /> Kembali
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <Form.Select
            size="sm"
            value={sortOrder}
            onChange={handleSortChange}
            style={{ maxWidth: "200px" }}
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </Form.Select>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteAll}
            disabled={historyList.length === 0}
          >
            <TrashFill className="me-1" /> Hapus Semua
          </Button>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>Tidak ada riwayat penggunaan.</p>
          </div>
        ) : (
          <>
            {sortedList.map((item) => (
              <div key={item.id} className="position-relative">
                <FeatureUsageCard
                  name={
                    item.name === "undefined undefined"
                      ? `User ID: ${item.user_id}`
                      : item.name
                  }
                  feature={item.feature}
                  change={item.change_text}
                  datetime={formatDate(item.datetime)}
                />
                <Button
                  variant="link"
                  className="text-danger p-0 mt-1 position-absolute bottom-0 end-0"
                  onClick={() => handleDeleteItem(item.id)}
                  style={{ fontSize: "0.8rem" }}
                >
                  <TrashFill className="me-1" /> Hapus
                </Button>
              </div>
            ))}
          </>
        )}
      </BsCard>
    </Container>
  );
}
