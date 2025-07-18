import { useState, useEffect } from "react";
import { Modal, Button, Form, ToggleButton, ToggleButtonGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

export default function TemperatureModal({ show, onClose }) {
  const [mode, setMode] = useState("auto");
  const [temp, setTemp] = useState("");
  const [dbTemp, setDbTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Handle auto mode temperature updates
  useEffect(() => {
    let intervalId;
    
    const fetchTemperature = async () => {
      if (mode !== 'auto') return;
      
      try {
        setIsAutoRefreshing(true);
        const res = await axios.get('http://localhost:5000/api/feature/get-temperature');
        
        if (res.data.status === 'success') {
          const { temperature, mode: currentMode } = res.data.data;
          
          // Only update if still in auto mode
          if (currentMode === 'auto') {
            const sensorTemp = parseFloat(temperature);
            setDbTemp(sensorTemp);
            setTemp(sensorTemp.toFixed(1));
          }
        }
      } catch (err) {
        console.error('Failed to fetch temperature:', err);
        toast.error('Gagal memperbarui suhu otomatis');
      } finally {
        setIsAutoRefreshing(false);
      }
    };

    // Initial fetch
    fetchTemperature();
    
    // Set up interval only in auto mode
    if (mode === 'auto') {
      intervalId = setInterval(fetchTemperature, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode]);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (show) {
      setMode("auto");
      setTemp("");
    }
  }, [show]);

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (mode === 'auto') {
    toast.warning('Tidak bisa menyimpan dalam mode otomatis');
    return;
  }

  const temperatureValue = parseFloat(temp);
  if (isNaN(temperatureValue)) {
    toast.error('Harap masukkan angka yang valid');
    return;
  }

  setIsLoading(true);
  
  try {
    const response = await axios.post(
      'http://localhost:5000/api/feature/temperature/manual',
      {
        temperature: temperatureValue,
        mode: 'manual' // Pastikan mode manual saat submit
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      toast.success(`Suhu ${temperatureValue}°C berhasil disimpan`);
      onClose();
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    toast.error(err.response?.data?.message || 'Gagal menyimpan suhu');
  } finally {
    setIsLoading(false);
  }
};

  // Handle input changes with validation
  const handleTempChange = (e) => {
    const value = e.target.value;
    
    // Basic validation for temperature input
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setTemp(value);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Pengaturan Suhu</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mode Kontrol</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={(val) => {
                setMode(val);
                if (val === 'auto' && dbTemp) {
                  setTemp(dbTemp.toFixed(1));
                }
              }}
              className="w-100"
            >
              <ToggleButton 
                id="auto" 
                value="auto" 
                variant={mode === 'auto' ? 'primary' : 'outline-primary'}
              >
                Otomatis
              </ToggleButton>
              <ToggleButton 
                id="manual" 
                value="manual" 
                variant={mode === 'manual' ? 'primary' : 'outline-primary'}
              >
                Manual
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          {mode === "auto" && (
            <Alert variant="info" className="text-center">
              {isAutoRefreshing ? (
                <div>
                  <Spinner animation="border" size="sm" /> Memperbarui data sensor...
                </div>
              ) : (
                dbTemp ? (
                  <>Suhu terkini dari sensor: <strong>{dbTemp.toFixed(1)}°C</strong></>
                ) : (
                  "Menghubungkan ke sensor..."
                )
              )}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Nilai Suhu {mode === 'auto' ? '(Otomatis)' : '(Manual)'}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={mode === 'auto' ? 'Data otomatis dari sensor' : 'Masukkan suhu'}
              value={temp}
              onChange={handleTempChange}
              disabled={mode === 'auto'}
              required
              className={mode === 'auto' ? 'bg-light' : ''}
            />
            <Form.Text className="text-muted">
              {mode === 'auto' 
                ? 'Nilai diambil langsung dari sensor DHT22'
                : 'Masukkan nilai antara 0°C sampai 50°C'}
            </Form.Text>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading || (mode === 'auto' && !dbTemp)}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" /> Menyimpan...
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </Button>
            <Button variant="outline-secondary" onClick={onClose}>
              Batal
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}