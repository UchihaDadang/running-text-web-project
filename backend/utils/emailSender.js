import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yusri338458@gmail.com", // alamat Gmail Anda
      pass: "giafsfhyjjqaoalb",      // App Password dari Gmail (bukan password biasa)
    },
  });

  const mailOptions = {
    from: '"Admin Web IoT" <yusri338458@gmail.com>', // Harus sama dengan user di atas
    to: email,
    subject: "Kode OTP Reset Password",
    text: `Halo,\n\nBerikut adalah kode OTP Anda untuk reset password: ${otp}\n\nJangan berikan kode ini kepada siapa pun.\n\nSalam,\nTim Web IoT`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP berhasil dikirim ke ${email}`);
  } catch (error) {
    console.error("Gagal mengirim OTP:", error.message);
    throw new Error("Gagal mengirim email OTP.");
  }
};
