// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua");
  const [adminNote, setAdminNote] = useState(""); // Untuk catatan admin

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "Kopi",
    description: "",
    image: "/images/kopi-gayo.jpg",
  });

  // Ambil orders real-time
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate().toLocaleString("id-ID")
          : new Date().toLocaleString("id-ID"),
      }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ambil products real-time
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  if (user.role !== "admin") {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>⛔ Akses Ditolak</h2>
        <p>Halaman ini hanya untuk admin.</p>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 30px",
            backgroundColor: "#1a1a2e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Kembali ke Home
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout berhasil!");
    navigate("/login");
  };

  // Orders CRUD - dengan catatan admin
  const updateOrderStatus = async (orderId, newStatus, note = "") => {
    try {
      const updateData = { status: newStatus };
      if (note) updateData.adminNote = note;

      await updateDoc(doc(db, "orders", orderId), updateData);
      toast.success(`Status diperbarui: ${newStatus}`);
      setAdminNote(""); // Reset catatan
    } catch (error) {
      toast.error("Gagal update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("Yakin hapus pesanan ini?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        toast.success("Pesanan dihapus!");
      } catch (error) {
        toast.error("Gagal hapus pesanan");
      }
    }
  };

  // Products CRUD
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      category: "Kopi",
      description: "",
      image: "/images/kopi-gayo.jpg",
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      image: product.image,
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast.error("Nama dan harga wajib diisi!");
      return;
    }

    const productData = {
      name: productForm.name,
      price: Number(productForm.price),
      category: productForm.category,
      description: productForm.description,
      image: productForm.image,
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast.success("Produk diperbarui!");
      } else {
        await addDoc(collection(db, "products"), productData);
        toast.success("Produk baru ditambahkan!");
      }
      setShowProductForm(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan produk");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Yakin hapus produk ini?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        toast.success("Produk dihapus!");
      } catch (error) {
        toast.error("Gagal hapus produk");
      }
    }
  };

  // Stats - STATUS DIUPDATE supaya konsisten dengan MyOrders.js
  const filteredOrders =
    activeTab === "semua"
      ? orders
      : orders.filter((order) => {
          if (activeTab === "menunggu")
            return order.status === "Menunggu Konfirmasi";
          if (activeTab === "dikonfirmasi")
            return order.status === "Dikonfirmasi";
          if (activeTab === "dikirim") return order.status === "Dikirim";
          if (activeTab === "selesai") return order.status === "Selesai";
          if (activeTab === "ditolak") return order.status === "Ditolak";
          return true;
        });

  const stats = {
    total: orders.length,
    menunggu: orders.filter((o) => o.status === "Menunggu Konfirmasi").length,
    dikonfirmasi: orders.filter((o) => o.status === "Dikonfirmasi").length,
    dikirim: orders.filter((o) => o.status === "Dikirim").length,
    selesai: orders.filter((o) => o.status === "Selesai").length,
    ditolak: orders.filter((o) => o.status === "Ditolak").length,
    totalPendapatan: orders
      .filter((o) => o.status === "Selesai" || o.status === "Dikonfirmasi")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    totalProducts: products.length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return "#f39c12"; // kuning
      case "Dikonfirmasi":
        return "#27ae60"; // hijau
      case "Dikirim":
        return "#3498db"; // biru
      case "Selesai":
        return "#2ecc71"; // hijau terang
      case "Ditolak":
        return "#e74c3c"; // merah
      default:
        return "#666";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>⏳ Loading...</div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>📊 Dashboard Admin</h1>
        <div>
          <span style={{ marginRight: "20px", color: "#666" }}>
            👤 {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e94560",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats - DIUPDATE dengan status baru */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        {[
          {
            label: "TOTAL PESANAN",
            value: stats.total,
            bg: "#1a1a2e",
            text: "white",
          },
          {
            label: "MENUNGGU",
            value: stats.menunggu,
            bg: "#f39c12",
            text: "white",
          },
          {
            label: "DIKONFIRMASI",
            value: stats.dikonfirmasi,
            bg: "#27ae60",
            text: "white",
          },
          {
            label: "DIKIRIM",
            value: stats.dikirim,
            bg: "#3498db",
            text: "white",
          },
          {
            label: "SELESAI",
            value: stats.selesai,
            bg: "#2ecc71",
            text: "white",
          },
          {
            label: "DITOLAK",
            value: stats.ditolak,
            bg: "#e74c3c",
            text: "white",
          },
          {
            label: "PENDAPATAN",
            value: `Rp ${stats.totalPendapatan.toLocaleString("id-ID")}`,
            bg: "#e94560",
            text: "white",
            isText: true,
          },
          {
            label: "PRODUK",
            value: stats.totalProducts,
            bg: "#0f3460",
            text: "white",
          },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              padding: "20px",
              backgroundColor: stat.bg,
              color: stat.text,
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                opacity: 0.8,
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontSize: stat.isText ? "18px" : "28px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Products CRUD - SAMA SEPERTI SEBELUMNYA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3>📦 Kelola Produk</h3>
        <button
          onClick={handleAddProduct}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ➕ Tambah Produk
        </button>
      </div>

      {showProductForm && (
        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h4 style={{ marginBottom: "20px" }}>
            {editingProduct ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}
          </h4>
          <form onSubmit={handleSaveProduct}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: 600,
                  }}
                >
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  placeholder="Nama produk"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: 600,
                  }}
                >
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  placeholder="85000"
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: 600,
                  }}
                >
                  Kategori
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <option value="Kopi">Kopi</option>
                  <option value="Teh">Teh</option>
                  <option value="Coklat">Coklat</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: 600,
                  }}
                >
                  Gambar (path)
                </label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  placeholder="/images/nama-gambar.jpg"
                />
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: 600,
                }}
              >
                Deskripsi
              </label>
              <textarea
                rows="3"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  resize: "vertical",
                }}
                placeholder="Deskripsi produk..."
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#1a1a2e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                💾 Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ❌ Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table - SAMA SEPERTI SEBELUMNYA */}
      <div
        style={{
          overflowX: "auto",
          marginBottom: "40px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a2e", color: "white" }}>
              <th style={{ padding: "15px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Gambar</th>
              <th style={{ padding: "15px", textAlign: "left" }}>
                Nama Produk
              </th>
              <th style={{ padding: "15px", textAlign: "left" }}>Kategori</th>
              <th style={{ padding: "15px", textAlign: "right" }}>Harga</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px" }}>#{product.id.slice(-6)}</td>
                <td style={{ padding: "15px" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </td>
                <td style={{ padding: "15px" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                  <p
                    style={{
                      margin: "5px 0 0",
                      fontSize: "13px",
                      color: "#666",
                    }}
                  >
                    {product.description?.substring(0, 50)}...
                  </p>
                </td>
                <td style={{ padding: "15px" }}>
                  <span
                    style={{
                      backgroundColor: "#e94560",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "15px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {product.category}
                  </span>
                </td>
                <td
                  style={{
                    padding: "15px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Rp {product.price?.toLocaleString("id-ID") || 0}
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  <button
                    onClick={() => handleEditProduct(product)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#ffc107",
                      color: "#1a1a2e",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "5px",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Section - DIUPDATE */}
      <h3 style={{ marginBottom: "20px" }}>📋 Pesanan Masuk (Real-time)</h3>

      {/* Tabs - DIUPDATE */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "semua", label: "Semua", count: stats.total },
          { key: "menunggu", label: "Menunggu", count: stats.menunggu },
          {
            key: "dikonfirmasi",
            label: "Dikonfirmasi",
            count: stats.dikonfirmasi,
          },
          { key: "dikirim", label: "Dikirim", count: stats.dikirim },
          { key: "selesai", label: "Selesai", count: stats.selesai },
          { key: "ditolak", label: "Ditolak", count: stats.ditolak },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor: activeTab === tab.key ? "#1a1a2e" : "#e0e0e0",
              color: activeTab === tab.key ? "white" : "#666",
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#666",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "12px",
          }}
        >
          Tidak ada pesanan{" "}
          {activeTab !== "semua" ? `dengan status "${activeTab}"` : ""}.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "15px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              {/* Header Order - TAMBAH INFO USER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                    Order #{order.id.slice(-6)}
                  </span>
                  <span
                    style={{
                      marginLeft: "15px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    {order.date}
                  </span>
                  {/* TAMBAH: Info user yang pesan */}
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "13px",
                      color: "#888",
                    }}
                  >
                    👤 {order.userName || "Unknown"} (
                    {order.userEmail || "No email"})
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 15px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: getStatusColor(order.status),
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Catatan Admin (jika ada) */}
              {order.adminNote && (
                <div
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    borderLeft: "4px solid #4caf50",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px", color: "#2e7d32" }}>
                    <strong>📝 Catatan Admin:</strong> {order.adminNote}
                  </p>
                </div>
              )}

              {/* Info Pelanggan */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px",
                      color: "#666",
                    }}
                  >
                    👤 Pelanggan
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {order.customer?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px",
                      color: "#666",
                    }}
                  >
                    📞 Telepon
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {order.customer?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px",
                      color: "#666",
                    }}
                  >
                    💳 Pembayaran
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {order.customer?.payment || "N/A"}
                  </p>
                </div>
              </div>

              {/* Alamat */}
              <div
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
                  <strong>📍 Alamat:</strong> {order.customer?.address || "N/A"}
                </p>
              </div>

              {/* Items */}
              <div style={{ marginBottom: "15px" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    marginBottom: "10px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  🛍️ Item Pesanan:
                </p>
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "10px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        {item.quantity} x Rp{" "}
                        {item.price?.toLocaleString("id-ID") || 0}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      Rp{" "}
                      {((item.price || 0) * item.quantity).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total & Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                  paddingTop: "15px",
                  borderTop: "2px solid #eee",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Total Item: {order.totalItems || 0}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#e94560",
                    }}
                  >
                    Total: Rp {(order.totalPrice || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Input Catatan Admin */}
                <div style={{ width: "100%", marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="Tambah catatan untuk user (opsional)..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Action Buttons - DIUPDATE dengan flow status lengkap */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {order.status === "Menunggu Konfirmasi" && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Dikonfirmasi", adminNote)
                        }
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#27ae60",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ✅ Konfirmasi
                      </button>
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Ditolak", adminNote)
                        }
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ❌ Tolak
                      </button>
                    </>
                  )}

                  {order.status === "Dikonfirmasi" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "Dikirim", adminNote)
                      }
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🚚 Kirim Pesanan
                    </button>
                  )}

                  {order.status === "Dikirim" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "Selesai", adminNote)
                      }
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#2ecc71",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✔️ Selesaikan
                    </button>
                  )}

                  {order.status === "Ditolak" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "Menunggu Konfirmasi")
                      }
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🔄 Aktifkan Kembali
                    </button>
                  )}

                  <button
                    onClick={() => deleteOrder(order.id)}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: "transparent",
                      color: "#dc3545",
                      border: "1px solid #dc3545",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
