// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Cek user yang login dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout berhasil!");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo → /home */}
      <Link to="/home" className="navbar-brand">
        ☕ Kedai Kopi
      </Link>

      <div className="navbar-links">
        {/* Home → /home */}
        <Link to="/home" className="nav-link">
          Home
        </Link>

        <Link to="/cart" className="nav-link" style={{ position: "relative" }}>
          🛒 Keranjang
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>

        {user ? (
          // ✅ SUDAH LOGIN: tampilkan Pesanan + nama user + Logout
          <>
            <Link to="/my-orders" className="nav-link">
              📋 Pesanan
            </Link>

            {/* Nama user */}
            <span
              className="nav-link"
              style={{
                color: "#666",
                cursor: "default",
                fontSize: "14px",
              }}
            >
              👤 {user.name || user.email}
            </span>

            {/* Tombol Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #e94560",
                color: "#e94560",
                padding: "6px 15px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                fontFamily: "inherit",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          // ✅ BELUM LOGIN: tampilkan tombol Login
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
