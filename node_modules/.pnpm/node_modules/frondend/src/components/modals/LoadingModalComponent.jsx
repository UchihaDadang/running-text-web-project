import { Spinner, Container, Row, Col } from "react-bootstrap";
import "../../../styles/ModernLoading.css";

export default function LoadingModalComponent({ message = "loading.." }) {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div className="loading-card p-4 rounded-4 text-center shadow-sm">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h6 className="text-primary">{message}</h6>
      </div>
    </Container>
  );
}