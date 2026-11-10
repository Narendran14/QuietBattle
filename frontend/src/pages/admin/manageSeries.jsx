import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/admin.css";

function ManageSeries() {
  const navigate = useNavigate();

  const [series, setSeries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const API = `${API_BASE_URL}/api/series`;

  const loadSeries = async () => {
    const response = await fetch(API);
    const data = await response.json();
    setSeries(data);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          navigate("/admin/login");
          return;
        }
        loadSeries();
      })
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  const saveSeries = async (e) => {
    e.preventDefault();

    const url = editId ? `${API}/${editId}` : API;
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMessage(editId ? "Series updated!" : "Series added!");
      setTitle("");
      setDescription("");
      setEditId(null);
      await loadSeries();
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }
  };

  const editSeries = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
  };

  const deleteSeries = async (id) => {
    if (!window.confirm("Delete this series?")) return;

    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setMessage("Series deleted!");
      loadSeries();
    } else {
      setMessage("Could not delete series.");
    }
  };

  return (
    <main className="manage-page">
      <button onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>

      <h1>Manage Series</h1>
      <p>Manage your QUIET BATTLES collections.</p>

      <form className="manage-form" onSubmit={saveSeries}>
        <h2>{editId ? "Edit Series" : "Add New Series"}</h2>

        <label>Series Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter series title"
          required
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />

        <button type="submit">{editId ? "Update Series" : "Add Series"}</button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setTitle("");
              setDescription("");
            }}
          >
            Cancel
          </button>
        )}

        <p>{message}</p>
      </form>

      <section className="series-list">
        <h2>Existing Series ({series.length})</h2>

        {series.map((item) => (
          <article key={item.id} className="manage-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>

            <button onClick={() => editSeries(item)}>Edit</button>

            <button onClick={() => deleteSeries(item.id)}>Delete</button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ManageSeries;
