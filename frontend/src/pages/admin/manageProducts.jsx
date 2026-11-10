import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/admin.css";

const API = `${API_BASE_URL}/api`;

function ManageProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const response = await fetch(`${API}/products`);
    if (!response.ok) throw new Error("Could not load products");
    setProducts(await response.json());
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const response = await fetch(`${API}/admin/dashboard`, {
          credentials: "include",
        });

        if (!response.ok) {
          navigate("/admin/login");
          return;
        }

        const productsResponse = await fetch(`${API}/products`);

        if (!productsResponse.ok) {
          throw new Error("Could not load products");
        }

        const data = await productsResponse.json();

        if (!cancelled) setProducts(data);
      } catch (error) {
        if (!cancelled) setMessage(error.message);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setEditId(null);
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        editId ? `${API}/products/${editId}` : `${API}/products`,
        {
          method: editId ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            price: Number(price),
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");

      setMessage(editId ? "Product updated!" : "Product added!");
      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editProduct = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(String(item.price));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");

      setMessage("Product deleted!");
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="manage-page">
      <button onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>

      <h1>Manage Products</h1>
      <p>Manage your QUIET BATTLES garments.</p>

      <form className="manage-form" onSubmit={saveProduct}>
        <h2>{editId ? "Edit Product" : "Add New Product"}</h2>

        <label>Product Name</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter product name"
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Enter product description"
        />

        <label>Price (₹)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          placeholder="Enter price"
        />

        <button type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>

        {editId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}

        <p>{message}</p>
      </form>

      <section className="series-list">
        <h2>Existing Products ({products.length})</h2>

        {products.map((item) => (
          <article className="manage-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <strong>₹{item.price}</strong>
            <div>
              <button onClick={() => editProduct(item)}>Edit</button>
              <button onClick={() => deleteProduct(item.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ManageProducts;
