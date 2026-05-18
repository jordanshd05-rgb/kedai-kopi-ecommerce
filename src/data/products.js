// src/pages/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../context/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Produk tidak ditemukan");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>⏳ Loading...</div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Produk tidak ditemukan
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} ditambahkan!`, {
      description: "Lihat keranjang untuk checkout",
      action: {
        label: "Lihat Keranjang",
        onClick: () => (window.location.href = "/cart"),
      },
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/" style={{ color: "#1a1a2e", textDecoration: "none" }}>
        ← Kembali ke Katalog
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "20px",
          alignItems: "start",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", borderRadius: "12px" }}
        />

        <div>
          <span
            style={{
              backgroundColor: "#e94560",
              color: "white",
              padding: "5px 15px",
              borderRadius: "15px",
              fontSize: "14px",
            }}
          >
            {product.category}
          </span>
          <h1 style={{ margin: "15px 0" }}>{product.name}</h1>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1a1a2e",
              marginBottom: "20px",
            }}
          >
            Rp {product.price?.toLocaleString("id-ID") || 0}
          </p>
          <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "30px" }}>
            {product.description}
          </p>
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            🛒 Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
