import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { LoginHistoryContext } from "./contexts/LoginHistoryContext";

export const LoginHistoryProvider = ({ children }) => {
  const [loginHistory, setLoginHistory] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const fetchLoginHistory = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/auth/login-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setLoginHistory(res.data.data);
      }
    } catch (err) {
      console.error("Gagal fetch riwayat login:", err);
    }
  }, []);

  const deleteHistoryById = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/auth/login-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoginHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal hapus riwayat:", err);
    }
  };

  const deleteAllHistory = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete("http://localhost:5000/api/auth/login-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoginHistory([]);
    } catch (err) {
      console.error("Gagal hapus semua riwayat:", err);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

  return (
    <LoginHistoryContext.Provider
      value={{
        loginHistory,
        setLoginHistory,
        fetchLoginHistory,
        deleteHistoryById,
        deleteAllHistory,
      }}
    >
      {children}
    </LoginHistoryContext.Provider>
  );
};
