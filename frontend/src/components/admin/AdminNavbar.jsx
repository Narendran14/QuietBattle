
function AdminNavbar({ title, subtitle = "Manage your brand workspace." }) {
  return (
    <header className="admin-topbar">
      <div>
        <p>{subtitle}</p>
        <h1>{title}</h1>
      </div>

      <span>Administrator</span>
    </header>
  );
}

export default AdminNavbar;
