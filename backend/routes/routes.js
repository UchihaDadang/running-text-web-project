import {
  registerUser,
  resetPassword,
  verifyOTP,
  login,
  forgotPassword,
  getProfile,
  requireRole,
  updateProfile,
  getLoginHistory,
  deleteLoginHistoryByUserId,
  handleEditText,
  getFeatureUsage,
  getLatestRunningText,
  saveTextTemplate,
  getTemplatesHandler,
  getDateTime,
  handleDateTime,
  handleEditTime,
  getTime,
  receiveSensorTemperature,
  handleTemperature,
  getTemperature,
  deleteFeatureUsageById,
  deleteAllFeatureUsage,
  handleSettingSpeedRunningText
} from '../handlers/handlers.js';

export const authRoutes = [
  {
    method: 'POST',
    path: '/register',
    handler: registerUser,
    options: { auth: false }
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    handler: login,
    options: { auth: false }
  },
  {
    method: "POST",
    path: "/api/auth/forgot-password",
    handler: forgotPassword,
    options: { auth: false }
  },
  {
    method: "POST",
    path: "/api/auth/verify-otp",
    handler: verifyOTP,
    options: { auth: false }
  },
  {
    method: "POST",
    path: "/api/auth/reset-password",
    handler: resetPassword,
    options: { auth: false }
  },
  {
    method: "GET",
    path: "/api/auth/profile",
    handler: getProfile,
    options: {
      auth: "jwt",
      pre: [{ method: requireRole(['dosen', 'mahasiswa', 'staff']) }]
    }
  },
  {
    method: "PUT",
    path: "/api/auth/update-profile",
    handler: updateProfile,
    options: {
      auth: "jwt",
      payload: {
        output: 'stream',
        parse: false,
        allow: 'multipart/form-data',
        maxBytes: 10 * 1024 * 1024,
        timeout: 60000 
      },
      cors: {
        origin: ['*'],
        headers: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
        additionalHeaders: ['cache-control', 'x-requested-with'],
        credentials: true
      }
    }
  },
  {
    method: "GET",
    path: "/api/auth/login-history",
    handler: getLoginHistory,
    options: {
      auth: "jwt"
    }
  },
  {
    method: 'DELETE',
    path: '/api/auth/login-history/{id}',
    handler: deleteLoginHistoryByUserId,
    options: {
      auth: "jwt"
    }
  },
  {
    method: 'POST',
    path: '/api/feature/edit-text',
    handler: handleEditText,
    options: {
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/api/feature/usage',
    handler: getFeatureUsage,
    options: {
      auth: "jwt"
    }
  },
  {
    method: 'GET',
    path: '/api/feature/running-text',
    handler: getLatestRunningText,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/api/feature/template',
    handler: saveTextTemplate,
    options: {
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/api/feature/template',
    handler: getTemplatesHandler,
    options: {
      auth: 'jwt',
    }
  },
  {
    method: "POST",
    path: "/api/feature/edit-date",
    handler: handleDateTime,
    options: {
      auth: "jwt"
    }
  },
  {
    method: "GET",
    path: "/api/feature/get-date",
    handler: getDateTime,
    options: {
      auth: false
    }
  },
  {
    method: "POST",
    path: "/api/feature/edit-time",
    handler: handleEditTime,
    options: {
      auth: "jwt",
    },
  },
  {
    method: "GET",
    path: "/api/feature/get-time",
    handler: getTime,
    options: {
      auth: false 
    }
  },
  {
    method: "POST",
    path: "/api/feature/temperature/sensor",
    handler: receiveSensorTemperature,
    options: { auth: false } // IoT bebas akses
  },
  {
    method: "GET",
    path: "/api/feature/get-temperature",
    handler: getTemperature,
    options: { auth: false }
  },
  {
    method: "POST",
    path: "/api/feature/temperature/manual",
    handler: handleTemperature,
    options: {
      auth: "jwt",
      cors: true,
    },
  },
  {
  method: 'DELETE',
  path: '/api/feature-usage/{id}',
  handler: deleteFeatureUsageById,
  options: { auth: 'jwt' }
},
{
  method: 'DELETE',
  path: '/api/feature-usage',
  handler: deleteAllFeatureUsage,
  options: { auth: 'jwt' }
},
{
  method: 'GET',
  path: '/api/running-text/speed',
  handler: handleSettingSpeedRunningText,
  options: {
    auth: false
  }
}



];