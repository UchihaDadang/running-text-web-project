import { useEffect, useState } from "react";
import {
  Container,
  Card as BsCard,
  Button,
  Form,
  Image,
} from "react-bootstrap";
import { ArrowLeft, TrashFill } from "react-bootstrap-icons";
import { useLoginHistory } from "../contexts/LoginHistoryContext";

export default function RiwayatLogin() {
  const { loginHistory, deleteHistoryById, deleteAllHistory, fetchLoginHistory } = useLoginHistory();
  const [sortOrder, setSortOrder] = useState("desc");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Tanggal tidak valid";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchLoginHistory();
    const interval = setInterval(fetchLoginHistory, 10000);
    return () => clearInterval(interval);
  }, [fetchLoginHistory]);

  const handleDeleteItem = (id) => {
    deleteHistoryById(id);
  };

  const handleDeleteAll = () => {
    deleteAllHistory();
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedLoginHistory = [...loginHistory].sort((a, b) =>
    sortOrder === "desc"
      ? new Date(b.loginTime) - new Date(a.loginTime)
      : new Date(a.loginTime) - new Date(b.loginTime)
  );

  return (
    <Container className="py-4">
      <BsCard className="p-4 shadow-sm rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Riwayat Login</h3>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="me-1" />
            Kembali
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
            disabled={loginHistory.length === 0}
          >
            <TrashFill className="me-1" /> Hapus Semua
          </Button>
        </div>

        {loginHistory.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>Tidak ada riwayat login pengguna.</p>
          </div>
        ) : (
          <>
            {sortedLoginHistory.map((item) => (
              <div
                key={`${item.userId}-${item.loginTime}`} // gunakan kombinasi unik
                className="border-bottom pb-3 mb-3 position-relative"
              >
                <div className="d-flex align-items-center">
                  <Image
                    src={item.photo}
                    roundedCircle
                    style={{ width: 60, height: 60, marginRight: "1rem" }}
                  />
                  <div>
                    <h6 className="mb-1">{item.name}</h6>
                    <small>ID: {item.userId || item.id}</small>
                    <div>
                      <span className="badge bg-primary mt-1">
                        {item.status}
                      </span>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {formatDate(item.loginTime)}
                    </small>
                  </div>
                </div>

                <Button
                  variant="link"
                  className="text-danger p-0 mt-1 position-absolute bottom-0 end-0"
                  onClick={() =>{ 
                    handleDeleteItem(item.id)
                    console.log(item.id)
                  }}
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
