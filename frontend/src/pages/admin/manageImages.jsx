
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/admin.css";

const API = `${API_BASE_URL}/api`;

function ManageImages() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("Homepage Hero");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadImages = async () => {
    try {
      const response = await fetch(`${API}/admin/images`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/admin/login");
        return;
      }

      if (!response.ok) throw new Error("Could not load images");

      const data = await response.json();
      setImages(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  loadImages();
}, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/admin/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Image uploaded successfully!");
      setFile(null);
      e.target.reset();
      setCategory("Homepage Hero");
      await loadImages();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/admin/images/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMessage("Image deleted successfully!");
      await loadImages();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="manage-page">
      <button onClick={() => navigate("/admin/dashboard")}>
        ← Dashboard
      </button>

      <h1>Image Management</h1>
      <p>Manage QUIET BATTLES visual assets.</p>

      <section className="manage-form">
        <h2>Upload Image</h2>

        <form onSubmit={handleUpload}>
          <label>Image Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Homepage Hero</option>
            <option>Series</option>
            <option>Chapters</option>
            <option>Product</option>
          </select>

          <label>Select Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />

          {file && (
            <div>
              <p>Preview: {file.name}</p>
              <img
                src={URL.createObjectURL(file)}
                alt="Selected preview"
                style={{
                  width: "180px",
                  height: "140px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </section>

      <section className="manage-form">
        <h2>Media Library ({images.length})</h2>

        {loading ? (
          <p>Loading images...</p>
        ) : images.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <div className="image-library-grid">
            {images.map((image) => (
              <article key={image.id} className="manage-card">
                <img
                  src={image.url}
                  alt={image.original_name}
                  style={{
                    width: "100%",
                    height: "190px",
                    objectFit: "cover",
                  }}
                />

                <h3>{image.original_name}</h3>
                <p>{image.category}</p>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(image.url)
                  }
                >
                  Copy Image URL
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ManageImages;
