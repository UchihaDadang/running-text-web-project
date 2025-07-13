import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectRoute';
import RiwayatLoginPage from './pages/RiwayatLogin';
import RiwayatUsagePage from './pages/RiwayatUsage';
import LoadingProvider from './LoadingContext';
import { UserProvider } from './UserContext';
import { LoginHistoryProvider } from './LoginHistoryContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <LoginHistoryProvider>
        <LoadingProvider>
          <BrowserRouter>
            <ToastContainer position="top-right" autoClose={2000} />
            <Routes>
              <Route path='/' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/reset-password' element={<ForgotPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/riwayat-login' element={<RiwayatLoginPage />} />
                <Route path='/riwayat-usage' element={<RiwayatUsagePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </LoginHistoryProvider>
    </UserProvider>
  </StrictMode>
);

