import { useState } from "react";
import { Container, Form, Card, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../service/authServices";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { LoadingContext } from "../../contexts/LoadingContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const { setLoading } = useContext(LoadingContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg("Email dan password harus diisi");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await loginUser({ email, password });
      console.log("Login response:", res);

      if (!res?.success) {
        throw new Error(res?.message || "Login gagal");
      }

      if (!res.token) {
        throw new Error("Token tidak diterima dari server");
      }

      // Simpan token
      localStorage.setItem("token", res.token);
      console.log("Token disimpan:", res.token);

      // Verifikasi penyimpanan token
      const storedToken = localStorage.getItem("token");
      if (storedToken !== res.token) {
        throw new Error("Gagal menyimpan token di localStorage");
      }

      // Navigasi ke dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat login");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Container style={{ maxWidth: "400px" }}>
        <Card className="p-4 shadow">
          <h3 className="text-center mb-4">Login</h3>

          {errorMsg && (
            <Alert variant="danger" dismissible onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={!email || !password}
            >
              Login
            </Button>

            <div className="mt-3 text-center">
              <Link to="/reset-password" className="text-decoration-none">
                Forgot Password?
              </Link>
              <span className="mx-2">|</span>
              <Link to="/register" className="text-decoration-none">
                Create New Account
              </Link>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}