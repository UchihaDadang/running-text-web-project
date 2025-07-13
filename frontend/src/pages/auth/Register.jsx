import { useState } from "react";
import { Container, Form, Card, Button, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    password: "",
    confirmPassword: "",
    nidn: "",
    nim: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [debugInfo, setDebugInfo] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name wajib diisi";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name wajib diisi";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.status) {
      newErrors.status = "Status wajib dipilih";
    }

    if (formData.status === "dosen" && !formData.nidn.trim()) {
      newErrors.nidn = "NIDN wajib diisi untuk dosen";
    } else if (formData.status === "mahasiswa" && !formData.nim.trim()) {
      newErrors.nim = "NIM/NPM wajib diisi untuk mahasiswa";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
    if (debugInfo) {
      setDebugInfo(null);
    }

    if (name === "status") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        nidn: "",
        nim: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        status: formData.status,
        password: formData.password
      };

      if (formData.status === "dosen") {
        submitData.nidn = formData.nidn.trim();
      } else if (formData.status === "mahasiswa") {
        submitData.nim = formData.nim.trim();
      }

      console.log("Sending registration data:", {
        ...submitData,
        password: "[HIDDEN]" 
      });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, 
      };

      const response = await axios.post("http://localhost:5000/register", submitData, config);
      
      console.log("Registration successful:", response.data);
      
      setMessage({ 
        type: "success", 
        text: "Registrasi berhasil! Silakan login dengan akun Anda." 
      });
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        status: "",
        password: "",
        confirmPassword: "",
        nidn: "",
        nim: ""
      });

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Terjadi kesalahan saat registrasi.";
      let debugInfo = "";
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        const status = error.response.status;
        const data = error.response.data;
        
        let serverMessage = "";
        if (typeof data === 'string') {
          serverMessage = data;
        } else if (data?.message) {
          serverMessage = data.message;
        } else if (data?.error) {
          serverMessage = data.error;
        } else if (data?.errors) {
          if (Array.isArray(data.errors)) {
            serverMessage = data.errors.map(err => err.msg || err.message || err).join(', ');
          } else {
            serverMessage = JSON.stringify(data.errors);
          }
        }
        
        switch (status) {
          case 400:
            errorMessage = serverMessage || "Data yang dikirim tidak valid. Periksa kembali form Anda.";
            break;
          case 409:
            errorMessage = serverMessage || "Email sudah terdaftar. Gunakan email lain.";
            break;
          case 422:
            errorMessage = serverMessage || "Format data tidak sesuai. Periksa kembali input Anda.";
            break;
          case 500:
            errorMessage = serverMessage || "Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.";
            
            debugInfo = `Server Error Details: ${JSON.stringify(data, null, 2)}`;
            console.error("Server error details:", data);
            
            if (serverMessage.toLowerCase().includes('duplicate') || 
                serverMessage.toLowerCase().includes('unique')) {
              errorMessage = "Email atau ID sudah terdaftar. Gunakan yang lain.";
            } else if (serverMessage.toLowerCase().includes('validation')) {
              errorMessage = "Validasi data gagal. Periksa kembali input Anda.";
            } else if (serverMessage.toLowerCase().includes('database') ||
                      serverMessage.toLowerCase().includes('connection')) {
              errorMessage = "Koneksi database bermasalah. Coba lagi dalam beberapa saat.";
            }
            break;
          default:
            errorMessage = serverMessage || `Error ${status}: Silakan coba lagi.`;
        }
        
        setMessage({ type: "danger", text: errorMessage });
        
        if (debugInfo) {
          console.log("Debug info will be shown:", debugInfo);
        }
        
      } else if (error.request) {
        console.error("Network error - no response received", error.request);
        setMessage({ 
          type: "danger", 
          text: "Tidak dapat terhubung ke server. Pastikan server berjalan di http://localhost:5000" 
        });
        
      } else if (error.code === 'ECONNABORTED') {
        setMessage({ 
          type: "danger", 
          text: "Request timeout. Server mungkin lambat atau tidak merespons." 
        });
        
      } else {
        console.error("Unexpected error:", error.message);
        setMessage({ 
          type: "danger", 
          text: `Terjadi kesalahan: ${error.message}` 
        });
      }
      
      if (error.response) {
        setDebugInfo({
          status: error.response.status,
          data: error.response.data,
          url: error.response.config?.url,
          method: error.response.config?.method
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 py-4">
      <Container style={{ maxWidth: "500px" }}>
        <Card className="p-4 shadow">
          <h3 className="text-center mb-4">Sign up</h3>

          {message.text && (
            <Alert variant={message.type} className="mb-3">
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    isInvalid={!!errors.firstName}
                    disabled={isLoading}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    isInvalid={!!errors.lastName}
                    disabled={isLoading}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                disabled={isLoading}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status *</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                isInvalid={!!errors.status}
                disabled={isLoading}
                required
              >
                <option value="">Select Status</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="staff">Staff</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.status}
              </Form.Control.Feedback>
            </Form.Group>

            {(formData.status === "dosen" || formData.status === "mahasiswa") && (
              <Form.Group className="mb-3" controlId="formIdentity">
                <Form.Label>
                  {formData.status === "dosen" ? "NIDN *" : "NIM / NPM *"}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={
                    formData.status === "dosen"
                      ? "Masukkan Nomor NIDN"
                      : "Masukkan Nomor NIM atau NPM"
                  }
                  name={formData.status === "dosen" ? "nidn" : "nim"}
                  value={formData.status === "dosen" ? formData.nidn : formData.nim}
                  onChange={handleChange}
                  isInvalid={!!(errors.nidn || errors.nim)}
                  disabled={isLoading}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nidn || errors.nim}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password (min. 6 characters)"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                disabled={isLoading}
                className="mb-2"
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                disabled={isLoading}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>

            <Form.Group className="text-center mt-3">
              <Link to="/" className="text-decoration-none">
                Have an Account? Login here
              </Link>
            </Form.Group>
          </Form>
        </Card>
      </Container>
    </div>
  );
}