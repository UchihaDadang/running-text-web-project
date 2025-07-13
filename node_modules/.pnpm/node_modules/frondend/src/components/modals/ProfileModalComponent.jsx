import { useState, useEffect, useContext } from "react";
import {
  Modal,
  Card,
  Image,
  Col,
  Row,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import AvatarDefault from "../../../src/assets/default-avatar.jpg";
import { UserContext } from "../../contexts/userContext";

export default function ProfilModalComponent({ show = true, onClose, onProfileUpdate }) {
  const { user, setUser } = useContext(UserContext);

  const [editName, setEditName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [nameError, setNameError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [_isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (show && user) {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      setEditName(fullName);
      setPhotoPreview(null);
      setPhotoFile(null);
      setNameError("");
      setPhotoError("");
      setIsEditing(false);
    }
  }, [show, user]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoError("");

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setPhotoError(`Tipe file tidak didukung: ${file.type}. Gunakan JPEG, PNG, GIF, atau WebP`);
        e.target.value = ''; // Reset file input
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Ukuran file maksimal 5MB");
        e.target.value = ''; // Reset file input
        return;
      }

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      const previewUrl = URL.createObjectURL(file);
      setPhotoFile(file);
      setPhotoPreview(previewUrl);
      
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setEditName(value);

    if (value.trim().length < 2) {
      setNameError("Nama minimal 2 karakter");
    } else if (value.trim().length > 50) {
      setNameError("Nama maksimal 50 karakter");
    } else {
      setNameError("");
    }
  };

  const handleSave = async () => {
    if (editName.trim().length < 2 || editName.trim().length > 50) {
      setNameError("Nama harus 2-50 karakter");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const formData = new FormData();
      formData.append("name", editName.trim());
      
      if (photoFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(photoFile.type)) {
          throw new Error(`Tipe file tidak didukung: ${photoFile.type}. Gunakan JPEG, PNG, GIF, atau WebP`);
        }
        
        if (photoFile.size > 5 * 1024 * 1024) {
          throw new Error("Ukuran file maksimal 5MB");
        }
        
        formData.append("photo", photoFile);
        
        console.log('Uploading file:', {
          name: photoFile.name,
          type: photoFile.type,
          size: photoFile.size
        });
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      console.log("Profil berhasil diperbarui:", data);
      
      const nameParts = editName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      
      // Update user context with new data
      const updatedUser = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        profile_picture: data.user?.profile_picture || user.profile_picture,
        profile_picture_url: data.user?.profile_picture 
          ? `http://localhost:5000/uploads/${data.user.profile_picture}?t=${Date.now()}`
          : null
      };
      
      setUser(updatedUser);

      // Call onProfileUpdate with updated user data
      if (typeof onProfileUpdate === 'function') {
        onProfileUpdate(updatedUser);
      }

      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setNameError("");
      setPhotoError("");

      alert("Profil berhasil diperbarui!");
      
      onClose();

    } catch (error) {
      console.error("Error saving profile:", error);
      setPhotoError(""); // Clear photo error
      setNameError(""); // Clear name error
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    
    setEditName("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setNameError("");
    setPhotoError("");
    setIsEditing(false);
    
    onClose();
  };

  // Display current photo or preview
  const displayPhoto = photoPreview 
    || (user?.profile_picture 
        ? `http://localhost:5000/uploads/${user.profile_picture}?t=${Date.now()}`
        : AvatarDefault);

  return (
    <Modal show={show} onHide={handleCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Profil Pengguna</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="p-3">
          <Row className="align-items-center">
            <Col>
              {/* Current user info display */}
              <div className="mb-3">
                <h5 className="mb-1">{user?.first_name} {user?.last_name}</h5>
                <div className="text-muted small">ID: <strong>{user?.id}</strong></div>
                <div className="text-muted small">Email: <strong>{user?.email}</strong></div>
              </div>

              {/* Edit form */}
              <Form.Group controlId="editNama" className="mb-3">
                <Form.Label>Edit Nama Lengkap</Form.Label>
                <Form.Control
                  type="text"
                  value={editName}
                  onChange={handleNameChange}
                  isInvalid={!!nameError}
                  placeholder="Masukkan nama lengkap Anda"
                  disabled={isSaving}
                />
                <Form.Control.Feedback type="invalid">
                  {nameError}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Nama akan dipisah menjadi nama depan dan belakang
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs="auto" className="text-center">
              <div className="position-relative">
                <Image
                  src={displayPhoto}
                  roundedCircle
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    border: photoPreview ? "3px solid #007bff" : "2px solid #dee2e6",
                  }}
                  onError={(e) => {
                    console.log("Modal image failed to load:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = AvatarDefault;
                  }}
                />
                {photoPreview && (
                  <div className="position-absolute top-0 end-0">
                    <span className="badge bg-primary rounded-pill">Baru</span>
                  </div>
                )}
              </div>
              
              <Form.Group controlId="uploadFoto" className="mt-3">
                <Form.Label
                  className={`btn btn-sm ${photoError ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                  style={{ cursor: "pointer" }}
                >
                  {photoPreview ? "Ganti Foto" : "Upload Foto"}
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
                    hidden
                    onChange={handlePhotoChange}
                    disabled={isSaving}
                  />
                </Form.Label>
              </Form.Group>
              
              {photoError && (
                <Alert variant="danger" className="mt-2 p-2 small">
                  {photoError}
                </Alert>
              )}
              
              {photoPreview && (
                <div className="text-muted small mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Foto baru dipilih
                </div>
              )}
              
              <div className="text-muted small mt-1">
                Format: JPEG, PNG, GIF, WebP<br/>
                Maksimal: 5MB
              </div>
            </Col>
          </Row>
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleCancel} 
          disabled={isSaving}
        >
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || !!nameError || !!photoError || !editName.trim()}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}