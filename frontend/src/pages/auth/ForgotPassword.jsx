import { useState, useContext } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { forgotPassword, verifyOtp, resetPassword } from "../../service/authServices";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/LoadingContext";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const { setLoading } = useContext(LoadingContext);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setStep(2);
      }
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message || "Gagal mengirim OTP. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setStep(3);
      }
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message || "OTP tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await resetPassword(email, newPassword);
      setMessage(res.message);

      if (res.success) {
        setEmail("");
        setOtp("");
        setNewPassword("");
        setStep(1);

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      setMessage(err.message || "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Container style={{ maxWidth: "500px" }}>
        <Card className="p-4 shadow">
          <h3 className="text-center mb-4">Forgot Password</h3>
          {message && <Alert variant="info">{message}</Alert>}

          {step === 1 && (
            <Form onSubmit={handleSendOTP}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100">Send OTP</Button>
            </Form>
          )}

          {step === 2 && (
            <Form onSubmit={handleVerifyOtp}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100">Verify OTP</Button>
            </Form>
          )}

          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100">Reset Password</Button>
            </Form>
          )}
        </Card>
      </Container>
    </div>
  );
}
