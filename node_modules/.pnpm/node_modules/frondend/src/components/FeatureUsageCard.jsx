import { Card } from "react-bootstrap";
import {
  GearFill,
  ArrowRepeat,
  PersonCircle
} from "react-bootstrap-icons";

export default function FeatureUsageCard({ name, feature, change, datetime }) {
  return (
    <Card
      className="mb-3 rounded-4 shadow-sm border-0"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      <Card.Body className="p-4">
        {/* Informasi Pengguna */}
        <div className="d-flex align-items-center mb-3">
          <PersonCircle className="me-2 text-secondary" size={24} />
          <div>
            <strong>{name}</strong>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              {datetime}
            </div>
          </div>
        </div>

        {/* Nama Fitur */}
        <div className="mt-2">
          <div className="text-primary fw-semibold">
            <GearFill className="me-1" /> Fitur:
          </div>
          <p className="ms-4">{feature}</p>
        </div>

        {/* Deskripsi Perubahan */}
        <div className="mt-3">
          <div className="text-info fw-semibold">
            <ArrowRepeat className="me-1" /> Perubahan:
          </div>
          <p className="ms-4">{change}</p>
        </div>
      </Card.Body>
    </Card>
  );
}
