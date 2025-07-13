import { useState, useEffect } from "react";
import { Modal, Button, Form, Card } from "react-bootstrap";
import { useUser } from "../../contexts/userContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function RunningTextModal({ show, onClose, onSave }) {
  const [text, setText] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/feature/edit-text",
        {
          text,
          userId: user.id,
          name: `${user.first_name} ${user.last_name}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      if (res.data.success) {
        toast.success("Teks berhasil dikirim.");
        if (onSave) onSave(text);
        onClose();
      } else {
        toast.error("Gagal mengirim teks.");
      }
    } catch (error) {
      console.error("Gagal kirim teks:", error);

      if (error.response?.status === 401) {
        toast.warn("Anda tidak memiliki izin. Silakan login ulang.");
      } else {
        toast.error("Terjadi kesalahan saat mengirim teks.");
      }
    }
  };

  const handleUseTemplate = (template) => {
    setText(template);
    setSelectedTemplate(template);
  };

  const handleSaveTemplate = async () => {
    if (!text) {
      toast.warning("Teks tidak boleh kosong!");
      return;
    }

    if (templates.includes(text)) {
      toast.info("Template sudah tersimpan.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Ambil token dari localStorage

      const res = await axios.post(
        "http://localhost:5000/api/feature/template",
        {
          text,
          userId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Kirim token ke backend
          },
        }
      );

      if (res.data.success) {
        setTemplates([...templates, text]);
        setSelectedTemplate(text);
        toast.success("Template berhasil disimpan.");
      } else {
        toast.error("Gagal menyimpan template.");
      }
    } catch (error) {
      console.error("Gagal simpan template:", error);
      toast.error("Terjadi kesalahan saat menyimpan.");
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/feature/template", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setTemplates(res.data.templates);
      } else {
        toast.error("Gagal memuat template.");
      }
    } catch (error) {
      console.error("Gagal fetch template:", error);
      toast.error("Terjadi kesalahan saat mengambil template.");
    }
  };

  useEffect(() => {
    if (show) {
      fetchTemplates();
    }
  }, [show]);


  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Ubah Teks Berjalan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Pilih Template</Form.Label>
            <Form.Select
              value={selectedTemplate}
              onChange={(e) => handleUseTemplate(e.target.value)}
            >
              <option value="">-- Pilih Template --</option>
              {templates.map((tpl, idx) => (
                <option key={idx} value={tpl}>
                  {tpl}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teks Baru</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="secondary" size="sm" onClick={handleSaveTemplate} className="mb-3">
            Simpan sebagai Template
          </Button>

          <Card className="p-3 bg-light">
            <h6 className="mb-3">Template Tersimpan:</h6>
            {templates.length === 0 ? (
              <small className="text-muted">Belum ada template tersimpan.</small>
            ) : (
              <ul className="list-unstyled mb-0">
                {templates.map((tpl, idx) => (
                  <li key={idx} className="mb-1">
                    <Button
                      variant="link"
                      className="p-0 text-start"
                      onClick={() => handleUseTemplate(tpl)}
                    >
                      {tpl}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Button type="submit" variant="primary" className="mt-3 w-100">
            Kirim
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}