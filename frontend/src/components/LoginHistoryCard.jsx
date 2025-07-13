import { Card, Image } from "react-bootstrap";

export default function LoginHistoryCard({ photo, name, userId, status}) {

  return (
      <Card className="me-3 shadow-sm flex-shrink-0 rounded-4" style={{ width: '300px', minHeight: '100px' }}>
      <Card.Body className="d-flex align-items-center">
        <Image src={photo} roundedCircle style={{ width: 60, height: 60, marginRight: '1rem' }} />
        <div>
          <h6 className="mb-1">{name}</h6>
          <small className="d-block">ID: {userId}</small>
          <span className="badge bg-primary mt-1">{status}</span>
        </div>
      </Card.Body>
    </Card>
  );
}