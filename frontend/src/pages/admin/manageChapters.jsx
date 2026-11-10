import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/admin.css";

const API = `${API_BASE_URL}/api`;

function ManageChapters() {
  const navigate = useNavigate();

  const [series, setSeries] = useState([]);
  const [products, setProducts] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [seriesId, setSeriesId] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [productId, setProductId] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const loadChapters = async (id) => {
    const response = await fetch(`${API}/series/${id}/chapters`);

    if (!response.ok) throw new Error("Could not load chapters");

    setChapters(await response.json());
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const auth = await fetch(`${API}/admin/dashboard`, {
          credentials: "include",
        });

        if (!auth.ok) {
          navigate("/admin/login");
          return;
        }

        const [seriesResponse, productResponse] = await Promise.all([
          fetch(`${API}/series`),
          fetch(`${API}/products`),
        ]);

        if (!seriesResponse.ok || !productResponse.ok) {
          throw new Error("Could not load management data");
        }

        const seriesData = await seriesResponse.json();
        const productData = await productResponse.json();

        if (cancelled) return;

        setSeries(seriesData);
        setProducts(productData);

        if (seriesData.length) {
          setSeriesId(String(seriesData[0].id));

          const response = await fetch(
            `${API}/series/${seriesData[0].id}/chapters`,
          );

          if (!response.ok) throw new Error("Could not load chapters");

          const chapterData = await response.json();

          if (!cancelled) setChapters(chapterData);
        }
      } catch (error) {
        if (!cancelled) setMessage(error.message);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const changeSeries = async (id) => {
    setSeriesId(id);
    setChapters([]);
    setMessage("");

    if (id) {
      try {
        await loadChapters(id);
      } catch (error) {
        setMessage(error.message);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setStory("");
    setProductId("");
    setEditId(null);
  };

  const saveChapter = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = editId
        ? `${API}/chapters/${editId}`
        : `${API}/series/${seriesId}/chapters`;

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          story,
          product_id: Number(productId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save chapter");
      }

      setMessage(editId ? "Chapter updated!" : "Chapter added!");
      resetForm();
      await loadChapters(seriesId);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editChapter = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setStory(item.story || "");
    setProductId(String(item.product_id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteChapter = async (id) => {
    if (!window.confirm("Delete this chapter?")) return;

    try {
      const response = await fetch(`${API}/chapters/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMessage("Chapter deleted!");
      await loadChapters(seriesId);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="manage-page">
      <button onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>

      <h1>Manage Chapters</h1>
      <p>Manage the stories behind your collections.</p>

      <label>Select Series</label>
      <select value={seriesId} onChange={(e) => changeSeries(e.target.value)}>
        <option value="">Select a series</option>
        {series.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>

      <form className="manage-form" onSubmit={saveChapter}>
        <h2>{editId ? "Edit Chapter" : "Add New Chapter"}</h2>

        <label>Chapter Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chapter title"
          required
        />

        <label>Story</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Enter chapter story"
          required
        />

        <label>Associated Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Select a product</option>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <button type="submit" disabled={!seriesId || !products.length}>
          {editId ? "Update Chapter" : "Add Chapter"}
        </button>

        {editId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}

        <p>{message}</p>
      </form>

      <section className="series-list">
        <h2>Existing Chapters ({chapters.length})</h2>

        {chapters.map((item) => (
          <article className="manage-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.story}</p>
            <p>
              Product:{" "}
              {products.find((p) => p.id === item.product_id)?.title ||
                "Product not found"}
            </p>

            <button onClick={() => editChapter(item)}>Edit</button>

            <button onClick={() => deleteChapter(item.id)}>Delete</button>
          </article>
        ))}

        {!chapters.length && <p>No chapters found for this series.</p>}
      </section>
    </main>
  );
}

export default ManageChapters;
