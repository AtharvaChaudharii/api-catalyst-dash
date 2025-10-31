import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Database, 
  FileText, 
  Home, 
  Menu, 
  Settings, 
  User, 
  Zap,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john@example.com");

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie("token");
        if (!token) return;
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data?.success) return;
        setUserName(data.user?.name || "");
        setUserEmail(data.user?.email || "");
      } catch {
        // ignore
      }
    };
    fetchProfile();
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">API Catalyst</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{userName || ""}</p>
                    <p className="text-xs text-muted-foreground">{userEmail || ""}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  Toggle theme
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // remove token cookie
                    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <header className="bg-background border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;