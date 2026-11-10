
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/admin.css";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          navigate("/admin/login");
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });

    navigate("/admin/login");
  };

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="admin-layout">
      <Sidebar onLogout={logout} />

      <main className="admin-main">
        <AdminNavbar
          title="Dashboard Overview"
          subtitle="WELCOME BACK"
        />

        <section className="admin-stats">
          <article>
            <p>TOTAL SERIES</p>
            <h2>{stats.total_series}</h2>
          </article>

          <article>
            <p>TOTAL CHAPTERS</p>
            <h2>{stats.total_chapters}</h2>
          </article>

          <article>
            <p>TOTAL PRODUCTS</p>
            <h2>{stats.total_products}</h2>
          </article>
        </section>

        <section className="admin-welcome">
          <p>CONTENT MANAGEMENT / SERIES 01</p>
          <h2>Manage your brand experience.</h2>
          <p>
            Control your collections, stories and products from one workspace.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
