import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Bot,
  Brain,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Map,
  Monitor,
  Search,
  Send,
  Settings,
  Swords,
  User,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard", exact: true },
  { label: "AI Visibility Score", icon: BarChart3, href: "/dashboard/analysis" },
  { label: "LLM Simulation", icon: Brain, href: "/dashboard/simulation" },
  { label: "Competitive Analysis", icon: Swords, href: "/dashboard/competitive" },
  { label: "Topic Graph", icon: Map, href: "/dashboard/topics" },
  { label: "Prompt Engine", icon: Search, href: "/dashboard/prompts" },
  { label: "Monitoring", icon: Monitor, href: "/dashboard/monitoring" },
];

const toolItems = [
  { label: "Content", icon: FileText, href: "/dashboard/content" },
  { label: "Generate Content", icon: Zap, href: "/dashboard/content/generate" },
  { label: "Publish", icon: Send, href: "/dashboard/publish" },
  { label: "AI Agent", icon: Bot, href: "/dashboard/agent" },
];

const manageItems = [
  { label: "Projects", icon: FolderOpen, href: "/dashboard/projects" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  function handleLogout() {
    localStorage.clear();
    navigate("/auth/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  }

  function NavLink({ item }: { item: { label: string; icon: React.ElementType; href: string; exact?: boolean } }) {
    const Icon = item.icon;
    const active = isActive(item.href, item.exact);
    return (
      <Link
        to={item.href}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          active ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-border flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">GAEO</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Main navigation */}
          <div>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3 mb-1.5">Analytics</p>
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3 mb-1.5">Content Tools</p>
            <div className="space-y-0.5">
              {toolItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* Manage */}
          <div>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3 mb-1.5">Manage</p>
            <div className="space-y-0.5">
              {manageItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center px-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/dashboard/monitoring" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            </Link>
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
