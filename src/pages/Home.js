// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useCart } from "../context/CartContext";

function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Ambil produk real-time dari Firebase
  useEffect(() => {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ["Semua", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === "Semua" || product.category === selectedCategory;
    const matchSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`, {
      description: `Rp ${product.price?.toLocaleString("id-ID") || 0}`,
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        ⏳ Loading produk...
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">☕ Katalog Produk</h1>

      {/* Search Bar */}
      <div style={{ maxWidth: "500px", margin: "0 auto 25px" }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 14px 14px 45px",
              border: "2px solid #e0e0e0",
              borderRadius: "50px",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Filter Kategori */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "10px 24px",
              borderRadius: "25px",
              border: "2px solid",
              borderColor: selectedCategory === cat ? "#1a1a2e" : "#e0e0e0",
              backgroundColor: selectedCategory === cat ? "#1a1a2e" : "#ffffff",
              color: selectedCategory === cat ? "#ffffff" : "#666666",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
        Menampilkan {filteredProducts.length} produk
      </p>

      {filteredProducts.length > 0 ? (
        <div className="cards-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <div className="product-body" style={{ padding: "20px" }}>
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
                <h3 style={{ margin: "12px 0 8px", fontSize: "18px" }}>
                  {product.name}
                </h3>
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginBottom: "12px",
                    lineHeight: "1.5",
                  }}
                >
                  {product.description?.substring(0, 60) || ""}...
                </p>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#1a1a2e",
                    marginBottom: "15px",
                  }}
                >
                  Rp {product.price?.toLocaleString("id-ID") || 0}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    to={`/product/${product.id}`}
                    style={{
                      flex: 1,
                      padding: "12px",
                      textAlign: "center",
                      border: "2px solid #1a1a2e",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1a1a2e",
                      fontWeight: "bold",
                    }}
                  >
                    Detail
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#1a1a2e",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    + Keranjang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>😕 Produk tidak ditemukan</h2>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua");
            }}
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
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
