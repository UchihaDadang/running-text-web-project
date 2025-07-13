// utils/authUtils.js
export const validateToken = (token) => {
  if (!token) return false;
  
  try {
    // Decode JWT token (jika menggunakan JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp && payload.exp < currentTime;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const handleAuthError = (navigate, showAlert = true) => {
  if (showAlert) {
    alert("Sesi anda telah berakhir, silakan login kembali");
  }
  localStorage.removeItem("token");
  navigate("/");
};