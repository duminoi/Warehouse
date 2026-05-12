import { NavLink, Outlet } from "react-router-dom";
import { Package, Plus, ClipboardList } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Package className="text-white w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-br from-white to-text-muted bg-clip-text text-transparent">
              Warehouse Management
            </h1>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-text-muted border-transparent hover:text-text hover:bg-surfaceHover hover:border-border"
                }`
              }
            >
              <ClipboardList className="w-4 h-4" />
              Phiếu nhập kho
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-text-muted border-transparent hover:text-text hover:bg-surfaceHover hover:border-border"
                }`
              }
            >
              <Plus className="w-4 h-4" />
              Tạo phiếu mới
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
