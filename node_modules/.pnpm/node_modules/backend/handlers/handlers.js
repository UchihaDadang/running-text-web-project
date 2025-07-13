import { db } from '../db/connection.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = "secretkey123";

// Fungsi Register User
export const registerUser = async (request, h) => {
  try {
    const {
      firstName,
      lastName,
      email,
      status,
      password,
      nidn,
      nim
    } = request.payload;

    if (!firstName || !lastName || !email || !status || !password) {
      return h.response({ 
        error: 'Missing required fields: firstName, lastName, email, status, password' 
      }).code(400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return h.response({ error: 'Invalid email format' }).code(400);
    }

    const validStatuses = ['dosen', 'mahasiswa', 'staff'];
    if (!validStatuses.includes(status)) {
      return h.response({ error: 'Invalid status. Must be: dosen, mahasiswa, or staff' }).code(400);
    }

    let nidnValue = null;
    let nimValue = null;
    if (status === 'dosen') {
      if (!nidn) {
        return h.response({ error: 'NIDN is required for dosen' }).code(400);
      }
      nidnValue = nidn;
    }
    if (status === 'mahasiswa') {
      if (!nim) {
        return h.response({ error: 'NIM is required for mahasiswa' }).code(400);
      }
      nimValue = nim;
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existingUsers.length > 0) {
      return h.response({ error: 'Email already registered' }).code(409);
    }

    if (nidnValue) {
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE nidn = ?',
        [nidnValue]
      );
      if (existing.length > 0) {
        return h.response({ error: 'NIDN already registered' }).code(409);
      }
    }

    if (nimValue) {
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE nim = ?',
        [nimValue]
      );
      if (existing.length > 0) {
        return h.response({ error: 'NIM already registered' }).code(409);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (first_name, last_name, email, password, role, nidn, nim) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        status,
        nidnValue,
        nimValue
      ]
    );

    return h.response({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        status,
        nidn: nidnValue,
        nim: nimValue
      }
    }).code(201);
  } catch (error) {
    console.error('Registration error:', error);
    return h.response({
      error: 'Registration failed. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }).code(500);
  }
};

// Fungsi Login - ✅ Sudah diperbarui: menambahkan first_name & last_name di token
export const login = async (request, h) => {
  const { email, password } = request.payload;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return h.response({ success: false, message: "User not found" }).code(404);
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return h.response({ success: false, message: "Incorrect password" }).code(401);
    }

    const token = jwt.sign({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }, JWT_SECRET, { expiresIn: "2h" });

    await db.execute("INSERT INTO login_history (user_id) VALUES (?)", [user.id]);

    return { success: true, token };
  } catch (err) {
    console.error(err);
    return h.response({ success: false, message: "Internal Server Error" }).code(500);
  }
};

// Middleware Role
export const requireRole = (allowedRoles) => {
  return (request, h) => {
    const userRole = request.auth.credentials.role;
    if (!allowedRoles.includes(userRole)) {
      return h
        .response({ success: false, message: "Akses ditolak" })
        .code(403)
        .takeover();
    }
    return h.continue;
  };
};

import { sendOTPEmail } from "../utils/emailSender.js";
import { request } from 'http';

const otpMap = new Map();

export const forgotPassword = async (request, h) => {
  const { email } = request.payload;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) {
    return h.response({ success: false, message: "Email not found" }).code(404);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 menit

  await sendOTPEmail(email, otp);
  return { success: true, message: "OTP sent to your email" };
};

export const verifyOTP = async (request, h) => {
  const { email, otp } = request.payload;
  const record = otpMap.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return h.response({ success: false, message: "Invalid or expired OTP" }).code(400);
  }
  return { success: true, message: "OTP verified" };
};

export const resetPassword = async (request, h) => {
  const { email, password } = request.payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
  otpMap.delete(email);
  return { success: true, message: "Password reset successful" };
};
 
export const getProfile = async (request, h) => {
  try {
    const { id } = request.auth.credentials;
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, role, nidn, nim, profile_picture FROM users WHERE id = ?", 
      [id]
    );

    if (rows.length === 0) {
      return h.response({ success: false, message: "User tidak ditemukan" }).code(404);
    }

    const user = rows[0];
    
    if (user.profile_picture) {
      user.profile_picture_url = `http://localhost:5000/uploads/${user.profile_picture}?t=${Date.now()}`;
    }

    return h.response({ 
      success: true, 
      user 
    }).code(200);
  } catch (error) {
    console.error("getProfile error:", error);
    return h.response({ success: false, message: "Terjadi kesalahan server" }).code(500);
  }
};

export const updateProfile = async (request, h) => {
  const userId = request.auth.credentials.id;
  
  try {
    const [currentUser] = await db.query(
      "SELECT profile_picture FROM users WHERE id = ?",
      [userId]
    );
    const currentFilename = currentUser[0]?.profile_picture;

    const { fields, files } = await processUpload(request);
    const name = fields.name[0] || '';
    
    let filename = null;
    if (files.photo) {
      filename = await handleFileUpload(files.photo[0], currentFilename);
    }

    const nameParts = name.trim().split(' ');
    await updateUserData(
      userId,
      nameParts[0],
      nameParts.slice(1).join(' '),
      filename
    );

    const [updatedUser] = await db.query(
      "SELECT id, first_name, last_name, email, role, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    return h.response({
      success: true,
      message: "Profil berhasil diperbarui",
      user: {
        ...updatedUser[0],
        profile_picture_url: updatedUser[0].profile_picture 
          ? `http://localhost:5000/uploads/${updatedUser[0].profile_picture}?t=${Date.now()}`
          : null
      }
    }).code(200);

  } catch (error) {
    console.error("Update profile error:", error);
    return h.response({
      success: false,
      message: error.message || "Gagal memperbarui profil"
    }).code(error.statusCode || 500);
  }
};

async function processUpload(request) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      uploadDir: "./uploads",
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 
    });

    form.parse(request.raw.req, (err, fields, files) => {
      if (err) {
        reject(new Error("Gagal memproses upload file"));
      }
      resolve({ fields, files });
    });
  });
}

async function handleFileUpload(file, currentFilename) {
  const fileExt = path.extname(file.originalFilename).toLowerCase().substr(1);
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  if (!allowedExtensions.includes(fileExt)) {
    throw { 
      message: "Format file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP",
      statusCode: 400 
    };
  }

  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ];
  
  if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
    throw { 
      message: "Tipe file tidak didukung",
      statusCode: 400 
    };
  }

  const filename = `${Date.now()}_${file.originalFilename}`;
  const newPath = path.join("uploads", filename);

  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
  }

  fs.renameSync(file.filepath, newPath);

  if (currentFilename) {
    const oldPath = path.join("uploads", currentFilename);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return filename;
}

async function updateUserData(userId, firstName, lastName, filename) {
  const updateQuery = filename
    ? "UPDATE users SET first_name = ?, last_name = ?, profile_picture = ? WHERE id = ?"
    : "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?";
  
  const updateParams = filename
    ? [firstName, lastName, filename, userId]
    : [firstName, lastName, userId];

  await db.query(updateQuery, updateParams);

  const [result] = await db.query(
    `SELECT id, first_name, last_name, email, profile_picture 
     FROM users WHERE id = ?`,
    [userId]
  );
  
  return result[0];
}

export const getLoginHistory = async (request, h) => {
  try {
    const [rows] = await db.query(`
      SELECT lh.id AS id, lh.login_time, u.id AS user_id, u.first_name, u.last_name, u.role, u.profile_picture
      FROM login_history lh
      JOIN users u ON lh.user_id = u.id
      ORDER BY lh.login_time DESC
    `);

    const history = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: `${row.first_name} ${row.last_name}`,
      status: row.role,
      photo: row.profile_picture
        ? `http://localhost:5000/uploads/${row.profile_picture}`
        : 'http://localhost:5000/uploads/default-avatar.jpg',
      loginTime: new Date(row.login_time).toISOString() 
    }));


    return h.response({ success: true, data: history });
  } catch (err) {
    console.error("Get login history error:", err);
    return h.response({ success: false, message: "Failed to fetch login history" }).code(500);
  }
};

export const deleteLoginHistoryByUserId = async (request, h) => {
  try {
    const { id } = request.params;
    
    if (!id) {
      return h.response({ 
        success: false, 
        message: "ID parameter is required" 
      }).code(400);
    }

    const [result] = await db.query(
      'DELETE FROM login_history WHERE id = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      return h.response({ 
        success: false, 
        message: "Login history record not found" 
      }).code(404);
    }

    return h.response({ 
      success: true, 
      message: "Login history record deleted successfully" 
    }).code(200);

  } catch (err) {
    console.error("Delete login history error:", err);
    return h.response({ 
      success: false, 
      message: "Failed to delete login history record" 
    }).code(500);
  }
};

export const deleteAllLoginHistory = async (request, h) => {
  try {
    await db.query(`DELETE FROM login_history`);
    return h.response({ success: true, message: "All login history deleted." });
  } catch (err) {
    console.error("Delete all error:", err);
    return h.response({ success: false, message: "Failed to delete all history." }).code(500);
  }
};

export const handleEditText = async (request, h) => {
  const { text } = request.payload;
  const user = request.auth.credentials;
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  if (!fullName) {
    console.warn("Nama pengguna tidak tersedia", user);
  }

  try {
    await db.query(
      `INSERT INTO running_texts (text, updated_by, updated_at) VALUES (?, ?, NOW())`,
      [text, user.id]
    );

    await db.query(
      `INSERT INTO feature_usage_history (user_id, name, feature, change_description, used_at)
      VALUES (?, ?, 'Edit Text', ?, NOW())`,
      [user.id, fullName, `Teks diubah menjadi: ${text}`]
    );

    return h.response({ success: true, message: 'Teks berhasil diperbarui.' }).code(200);
  } catch (error) {
    console.error("Error di handleEditText:", error);
    return h.response({ success: false, message: 'Gagal menyimpan data.' }).code(500);
  }
};

export const getFeatureUsage = async (request, h) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, name, feature, change_description AS change_text, used_at AS datetime
       FROM feature_usage_history
       ORDER BY used_at DESC`
    );

    return h.response({ status: "success", data: rows }).code(200);
  } catch (error) {
    console.error("Error di getFeatureUsage:", error);
    return h.response({ status: "error", message: 'Gagal mengambil data.' }).code(500);
  }
};

export const getLatestRunningText = async (request, h) => {
  try {
    const [rows] = await db.query(`
      SELECT text, updated_at
      FROM running_texts
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return h.response({ success: false, message: 'Belum ada teks.' }).code(404);
    }

    return h.response({
      success: true,
      data: {
        text: rows[0].text,
        updatedAt: rows[0].updated_at
      }
    }).code(200);
  } catch (error) {
    console.error("Error di getLatestRunningText:", error);
    return h.response({ success: false, message: 'Gagal mengambil teks.' }).code(500);
  }
};

export const deleteFeatureUsageById = async (request, h) => {
  try {
    const { id } = request.params;

    if (!id) {
      return h.response({
        success: false,
        message: "ID diperlukan untuk menghapus data."
      }).code(400);
    }

    const [result] = await db.query(
      'DELETE FROM feature_usage_history WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return h.response({
        success: false,
        message: "Data tidak ditemukan."
      }).code(404);
    }

    return h.response({
      success: true,
      message: "Data berhasil dihapus."
    }).code(200);
  } catch (err) {
    console.error("Error delete fitur usage:", err);
    return h.response({
      success: false,
      message: "Gagal menghapus data."
    }).code(500);
  }
};

export const deleteAllFeatureUsage = async (request, h) => {
  try {
    await db.query('DELETE FROM feature_usage_history');
    
    return h.response({
      success: true,
      message: "Semua riwayat penggunaan fitur berhasil dihapus."
    }).code(200);
  } catch (err) {
    console.error("Error delete all fitur usage:", err);
    return h.response({
      success: false,
      message: "Gagal menghapus semua riwayat."
    }).code(500);
  }
};

export const saveTextTemplate = async (request, h) => {
  const { text, userId } = request.payload;

  try {
    await db.query(
      `INSERT INTO text_templates (text, created_by) VALUES (?, ?)`,
      [text, userId]
    );

    return h.response({ success: true, message: 'Template berhasil disimpan.' }).code(201);
  } catch (err) {
    console.error("Gagal simpan template:", err);
    return h.response({ success: false, message: 'Gagal menyimpan template.' }).code(500);
  }
};

export const getTemplatesHandler = async (request, h) => {
  try {
    const [rows] = await db.query(
      `SELECT text FROM text_templates ORDER BY id DESC`
    );

    return h.response({
      success: true,
      templates: rows.map(row => row.text),
    });
  } catch (error) {
    console.error("Error getTemplates:", error);
    return h.response({ success: false, message: "Gagal mengambil template" }).code(500);
  }
};

export const handleDateTime = async (request, h) => {
  const { date, mode } = request.payload;
  const user = request.auth.credentials;

  try {
    const now = new Date();

    const localDate = new Date(now.getTime())
      .toISOString()
      .slice(0, 10);

    const finalDate = date || localDate;
    const defaultTime = '00:00:00'; // default jika belum ada fitur edit jam

    await db.query(
      `INSERT INTO display_datetime (date, time, mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [finalDate, defaultTime, mode, now, now]
    );

    await db.query(
      `INSERT INTO feature_usage_history (user_id, name, feature, change_description, used_at)
       VALUES (?, ?, 'Edit Date', ?, NOW())`,
      [
        user.id,
        `${user.first_name} ${user.last_name}`,
        `Tanggal diubah menjadi: ${finalDate} (${mode})`,
      ]
    );

    return h.response({ status: "success", message: "Tanggal berhasil disimpan." }).code(200);
  } catch (err) {
    console.error("Error simpan tanggal:", err);
    return h.response({ status: "error", message: "Gagal menyimpan tanggal." }).code(500);
  }
};

export const getDateTime = async (request, h) => {
  try {
    const [rows] = await db.query(
      `SELECT date, time, mode FROM display_datetime ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return h
        .response({ status: "empty", message: "Belum ada data tanggal." })
        .code(404);
    }

    // Konversi ke zona waktu lokal (WIB/GMT+7)
    const rawDate = new Date(rows[0].date);
    rawDate.setHours(rawDate.getHours() + 7); // tambah 7 jam

    const dateString = rawDate.toISOString().split('T')[0]; // hanya ambil yyyy-mm-dd

    return h.response({
      status: "success",
      data: {
        date: dateString,
        time: rows[0].time,
        mode: rows[0].mode
      }
    }).code(200);
  } catch (err) {
    console.error("Error get-date:", err);
    return h
      .response({ status: "error", message: "Gagal mengambil data." })
      .code(500);
  }
};

export const handleEditTime = async (request, h) => {
  const { time, mode } = request.payload;
  const user = request.auth.credentials;

  try {
    const now = new Date();
    const [hours, minutes] = time.split(":");
    const formattedTime = `${hours}:${minutes}:00`; // Format: HH:MM:SS

    await db.query(
      `INSERT INTO display_datetime (date, time, mode, created_at, updated_at)
       VALUES (CURDATE(), ?, ?, ?, ?)`,
      [formattedTime, mode, now, now]
    );

    await db.query(
      `INSERT INTO feature_usage_history (user_id, name, feature, change_description, used_at)
       VALUES (?, ?, 'Edit Time', ?, NOW())`,
      [
        user.id,
        `${user.first_name} ${user.last_name}`,
        `Jam diubah menjadi: ${formattedTime} (${mode})`,
      ]
    );

    return h.response({ status: "success", message: "Jam berhasil disimpan." }).code(200);
  } catch (err) {
    console.error("Error simpan jam:", err);
    return h.response({ status: "error", message: "Gagal menyimpan jam." }).code(500);
  }
};

export const getTime = async (request, h) => {
  try {
    const [rows] = await db.query(
      `SELECT time, mode FROM display_datetime ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return h.response({ status: "empty", message: "Belum ada data jam." }).code(404);
    }

    return h.response({ status: "success", data: rows[0] }).code(200);
  } catch (err) {
    console.error("Error get-time:", err);
    return h.response({ status: "error", message: "Gagal mengambil data jam." }).code(500);
  }
};

export const receiveSensorTemperature = async (request, h) => {
  const { temperature } = request.payload;

  try {
    // Simpan ke log
    await db.query(
      `INSERT INTO temperature_data (temperature, mode, source) VALUES (?, 'auto', 'sensor')`,
      [temperature]
    );

    // Simpan ke tampilan display (hanya sekali yang paling baru)
    await db.query(
      `INSERT INTO display_temperature (temperature, mode, created_at, updated_at)
       VALUES (?, 'auto', NOW(), NOW())`,
      [temperature]
    );

    return h.response({ status: "success", message: "Data suhu dari sensor berhasil disimpan & ditampilkan." }).code(200);
  } catch (err) {
    console.error("Error simpan suhu sensor:", err);
    return h.response({ status: "error", message: "Gagal simpan suhu." }).code(500);
  }
};

export const saveManualTemperature = async (request, h) => {
  const { temperature, mode } = request.payload;
  const user = request.auth.credentials;

  try {
    await db.query(
      `INSERT INTO temperature_data (temperature, mode, source) VALUES (?, ?, 'user')`,
      [temperature, mode]
    );

    await db.query(
      `INSERT INTO feature_usage_history (user_id, name, feature, change_description, used_at)
       VALUES (?, ?, 'Edit Temperature', ?, NOW())`,
      [
        user.id,
        `${user.first_name} ${user.last_name}`,
        `Suhu diubah menjadi: ${temperature}°C (${mode})`
      ]
    );

    return h.response({ status: "success", message: "Suhu berhasil disimpan." }).code(200);
  } catch (err) {
    console.error("Error simpan suhu manual:", err);
    return h.response({ status: "error", message: "Gagal menyimpan suhu." }).code(500);
  }
};

export const handleTemperature = async (request, h) => {
  const { temperature, mode } = request.payload;
  const user = request.auth.credentials;

  try {
    // Simpan ke display_temperature (untuk ditampilkan ke IoT)
    await db.query(
      `INSERT INTO display_temperature (temperature, mode, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [temperature, mode]
    );

    // Simpan ke temperature_data (log lengkap)
    await db.query(
      `INSERT INTO temperature_data (temperature, mode, source)
       VALUES (?, ?, 'user')`,
      [temperature, mode]
    );

    // Simpan ke riwayat
    await db.query(
      `INSERT INTO feature_usage_history (user_id, name, feature, change_description, used_at)
       VALUES (?, ?, 'Edit Temperature', ?, NOW())`,
      [
        user.id,
        `${user.first_name} ${user.last_name}`,
        `Suhu diubah menjadi: ${temperature}°C (${mode})`
      ]
    );

    return h.response({ status: "success", message: "Suhu berhasil disimpan." }).code(200);
  } catch (err) {
    console.error("Error simpan suhu:", err);
    return h.response({ status: "error", message: "Gagal menyimpan suhu." }).code(500);
  }
};

export const getTemperature = async (request, h) => {
  try {
    const [rows] = await db.query(
      `SELECT temperature, mode FROM display_temperature ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return h.response({ status: "empty", message: "Belum ada data suhu." }).code(404);
    }

    return h.response({ status: "success", data: rows[0] }).code(200);
  } catch (err) {
    console.error("Error get-temperature:", err);
    return h.response({ status: "error", message: "Gagal mengambil data suhu." }).code(500);
  }
};

export const handleSettingSpeedRunningText = async (request, h) => {
        try {
        const [rows] = await db.query("SELECT speed FROM running_text_settings LIMIT 1");

        if (rows.length === 0) {
          return h.response("50").code(200); // default speed
        }

        return h.response(String(rows[0].speed)).code(200);
      } catch (error) {
        console.error("Error ambil speed:", error);
        return h.response("50").code(500); // fallback speed
      }

}










