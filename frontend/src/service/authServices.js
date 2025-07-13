
export const loginUser = async (credentials) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Jika response tidak ok, lempar error dengan message dari server
      throw new Error(data.message || "Login failed");
    }

    if (!data.token) {
      throw new Error("Token tidak ditemukan dalam response server");
    }

    return {
      success: true,
      token: data.token,
      message: data.message || "Login successful"
    };
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

const API = "http://localhost:5000/api/auth";

export const forgotPassword = async (email) => {
  try {
    const res = await fetch(`${API}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (error) {
    console.error("error:", error);
    return { success: false, message: "Server error" };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const res = await fetch(`${API}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Server error" };
  }
};

export const resetPassword = async (email, password) => {
  try {
    const res = await fetch(`${API}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Server error" };
  }
};


