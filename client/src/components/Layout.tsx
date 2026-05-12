import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="logo-icon">WH</div>
            <h1>Warehouse Management</h1>
          </div>
          <nav className="header-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              📋 Phiếu nhập kho
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              ➕ Tạo phiếu mới
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
