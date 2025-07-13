import { useState, useEffect } from "react";
import { Modal, Button, Form, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

export default function TemperatureModal({ show, onClose, onSave }) {
  const [mode, setMode] = useState("auto");
  const [temp, setTemp] = useState("");
  const [dbTemp, setDbTemp] = useState(25);

  useEffect(() => {
    if (mode === "auto") {
      const fetchTempFromAPI = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/feature/get-temperature");
          const json = await res.json();
          if (json.status === "success" && json.data.mode === "auto") {
            const sensorTemp = parseFloat(json.data.temperature);
            setDbTemp(sensorTemp);
            setTemp(sensorTemp.toFixed(1));
          }
        } catch (err) {
          console.error("Gagal ambil suhu sensor:", err);
        }
      };

      fetchTempFromAPI();
      const interval = setInterval(fetchTempFromAPI, 5000); // refresh tiap 5 detik
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Simpan suhu ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token tidak ditemukan, harap login ulang.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/feature/temperature/manual",
        {
          temperature: parseFloat(temp),
          mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Suhu berhasil disimpan!");
      if (onSave) onSave({ mode, temperature: parseFloat(temp) });
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan suhu:", err);
      toast.error("Gagal menyimpan suhu.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Setel Suhu</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mode Suhu</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={setMode}
              className="w-100"
            >
              <ToggleButton id="auto" value="auto" variant="outline-primary" className="me-2">
                Otomatis
              </ToggleButton>
              <ToggleButton id="manual" value="manual" variant="outline-primary">
                Manual
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          {mode === "auto" && (
            <div className="alert alert-info mb-3 text-center">
              Suhu terkini dari sensor: <strong>{dbTemp.toFixed(1)}°C</strong>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Suhu ({mode === "auto" ? "Otomatis" : "Manual"})</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              max="50"
              placeholder="Contoh: 26"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              disabled={mode === "auto"}
              required
              style={{ cursor: mode === "auto" ? "not-allowed" : "text" }}
            />
            {mode === "auto" && (
              <Form.Text className="text-muted">
                Suhu akan diambil langsung dari sensor.
              </Form.Text>
            )}
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-2 w-100">
            Simpan
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
