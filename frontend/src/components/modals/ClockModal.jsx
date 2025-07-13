import { useState, useEffect } from "react";
import { Modal, Button, Form, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

export default function ClockModal({ show, onClose, onSave }) {
  const [mode, setMode] = useState("auto");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (mode === "auto") {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
  }, [mode]);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let finalTime = time;
    if (mode === "auto") {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      finalTime = `${hours}:${minutes}`;
      setTime(finalTime); // Update state untuk UI
    }

    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/api/feature/edit-time",
      { time: finalTime, mode },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Jam berhasil disimpan!");
    if (onSave) onSave({ time: finalTime, mode });
    onClose();
  } catch (error) {
    console.error("Gagal simpan jam:", error);
    toast.error("Gagal menyimpan jam!");
  }
};


  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Atur Jam</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mode Jam</Form.Label>
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

          <Form.Group className="mb-3">
            <Form.Label>Jam</Form.Label>
            <Form.Control
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={mode === "auto"}
              required
              style={{ cursor: mode === "auto" ? "not-allowed" : "pointer" }}
            />
            {mode === "auto" && (
              <Form.Text className="text-muted">
                Jam akan mengikuti waktu sistem Anda.
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