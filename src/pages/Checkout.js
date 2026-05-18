// src/pages/Checkout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Checkout() {
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Ambil data user yang login
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "transfer",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    if (!currentUser) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId: currentUser.id, // ✅ ID unik user dari Firestore
        userEmail: currentUser.email, // ✅ Email user
        userName: currentUser.name, // ✅ Nama user
        customer: formData,
        items: cartItems,
        totalItems: totalItems,
        totalPrice: totalPrice,
        status: "Menunggu Konfirmasi",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      toast.success("Pesanan berhasil dibuat!", {
        description: `Order ID: ${docRef.id.slice(-6)}`,
        duration: 4000,
      });

      clearCart();
      navigate("/my-orders");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal membuat pesanan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>⏳ Memuat...</h2>
        <p>Mengecek sesi login...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Keranjang Kosong</h2>
        <p>Tidak ada item untuk checkout.</p>
        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#e94560",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🛍️ Lihat Produk
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px" }}>📦 Checkout</h1>

      {/* Info User */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#e8f5e9",
          borderRadius: "8px",
          marginBottom: "20px",
          borderLeft: "4px solid #4caf50",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>
          👤 Checkout sebagai: {currentUser.name} ({currentUser.email})
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}
      >
        {/* Ringkasan Pesanan */}
        <div>
          <h3 style={{ marginBottom: "20px" }}>Ringkasan Pesanan</h3>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "15px",
                padding: "15px",
                borderBottom: "1px solid #eee",
                alignItems: "center",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: "bold", margin: "0" }}>{item.name}</p>
                <p style={{ color: "#666", margin: "5px 0 0" }}>
                  {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
              <p style={{ fontWeight: "bold" }}>
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Total Item:</span>
              <span>{totalItems}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              <span>Total Bayar:</span>
              <span style={{ color: "#e94560" }}>
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Form Pengiriman */}
        <div>
          <h3 style={{ marginBottom: "20px" }}>Data Pengiriman</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                No. Telepon
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Alamat Lengkap
              </label>
              <textarea
                required
                rows="4"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Metode Pembayaran
              </label>
              <select
                value={formData.payment}
                onChange={(e) =>
                  setFormData({ ...formData, payment: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <option value="transfer">Transfer Bank</option>
                <option value="cod">Bayar di Tempat (COD)</option>
                <option value="ewallet">E-Wallet (OVO/Dana/GoPay)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: isSubmitting ? "#ccc" : "#e94560",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "⏳ Memproses..." : "🛍️ Pesan Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
