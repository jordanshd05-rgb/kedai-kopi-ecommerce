// src/pages/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Cari user di Firestore berdasarkan email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Email tidak terdaftar! Silakan daftar dulu.");
        setIsSubmitting(false);
        return;
      }

      // Ambil data user pertama (email unik)
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Cek password
      if (userData.password !== password) {
        toast.error("Password salah!");
        setIsSubmitting(false);
        return;
      }

      // Simpan user ke localStorage (tambah userId dari Firestore)
      const user = {
        id: userDoc.id, // ID dokumen Firestore
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };

      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Selamat datang, ${userData.name}!`);

      // Redirect berdasarkan role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error login:", error);
      toast.error("Gagal login. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title">☕ Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Memproses..." : "Masuk"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Belum punya akun?{" "}
          <Link to="/register" style={{ color: "#e94560", fontWeight: 600 }}>
            Daftar
          </Link>
        </p>

        <div className="demo-box">
          {/* <p>
            <strong>🔑 Demo Login:</strong>
          </p>
          <p>Admin: admin@kedai.com / admin123</p> */}
          <p>User: Daftar dulu di halaman Register!</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
