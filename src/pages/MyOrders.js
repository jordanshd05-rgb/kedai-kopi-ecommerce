// src/pages/MyOrders.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek user yang login
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    // ✅ FILTER: Hanya ambil pesanan milik user ini!
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.id), // 🔥 Filter by userId!
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return "#f39c12"; // kuning
      case "Dikonfirmasi":
        return "#27ae60"; // hijau
      case "Ditolak":
        return "#e74c3c"; // merah
      case "Dikirim":
        return "#3498db"; // biru
      case "Selesai":
        return "#2ecc71"; // hijau terang
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return "⏳";
      case "Dikonfirmasi":
        return "✅";
      case "Ditolak":
        return "❌";
      case "Dikirim":
        return "🚚";
      case "Selesai":
        return "🎉";
      default:
        return "📦";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        ⏳ Memuat pesanan...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "10px" }}>📋 Pesanan Saya</h1>
      {currentUser && (
        <p style={{ color: "#666", marginBottom: "30px" }}>
          👤 {currentUser.name} ({currentUser.email})
        </p>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          <h3>Belum ada pesanan</h3>
          <p>Yuk, mulai belanja!</p>
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
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* Header Order */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                    Order #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginTop: "5px",
                    }}
                  >
                    {order.createdAt?.toDate().toLocaleString("id-ID") ||
                      "Baru saja"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "white",
                      backgroundColor: getStatusColor(order.status),
                      display: "inline-block",
                      marginBottom: "5px",
                    }}
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>
              </div>

              {/* Info Tambahan dari Admin */}
              {order.adminNote && (
                <div
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    borderLeft: "4px solid #ffc107",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    <strong>📝 Catatan Admin:</strong> {order.adminNote}
                  </p>
                </div>
              )}

              {/* Detail Items */}
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  Detail Pesanan:
                </p>
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                  >
                    <span>
                      {item.name} ({item.quantity}x)
                    </span>
                    <span style={{ fontWeight: "bold" }}>
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "15px",
                  borderTop: "2px solid #eee",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                <span>Total:</span>
                <span style={{ color: "#e94560" }}>
                  Rp {order.totalPrice?.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Info Pengiriman */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  📦 Info Pengiriman:
                </p>
                <p style={{ margin: "3px 0" }}>👤 {order.customer?.name}</p>
                <p style={{ margin: "3px 0" }}>📱 {order.customer?.phone}</p>
                <p style={{ margin: "3px 0" }}>📍 {order.customer?.address}</p>
                <p style={{ margin: "3px 0" }}>💳 {order.customer?.payment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
