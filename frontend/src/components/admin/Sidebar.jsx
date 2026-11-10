
import { Link } from "react-router-dom";

function Sidebar({ onLogout }) {
  return (
    <aside className="admin-sidebar">
      <h2>
        QUIET BATTLES<span>™</span>
      </h2>

      <p>ADMIN WORKSPACE</p>

      <nav>
        <Link to="/admin/dashboard">Overview</Link>
        <Link to="/admin/series">Series</Link>
        <Link to="/admin/chapters">Chapters</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/images">Images</Link>
      </nav>

      <button onClick={onLogout}>LOGOUT</button>

      <Link to="/" className="back-to-website">
        <span>←</span> Back to Website
      </Link>
    </aside>
  );
}

export default Sidebar;
