import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  FileText,
  Plus,
  ShieldCheck,
  BarChart3,
  Settings,
  CreditCard,
  HelpCircle,
  Menu,
  User,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";
import {
  CreateProposalProvider,
  useCreateProposalModal,
} from "@/contexts/CreateProposalContext";
import CreateProposalModal from "@/components/create-proposal/CreateProposalModal";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "Verification", href: "/verification", icon: ShieldCheck },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <CreateProposalProvider>
      <LayoutShell>{children}</LayoutShell>
      <CreateProposalModal />
    </CreateProposalProvider>
  );
}

function LayoutShell({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { openModal } = useCreateProposalModal();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "plus":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const publicProfilePath = user ? `/business/biz_${user.id}` : "/discovery";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <div
                  className="flex items-center justify-center"
                  style={{
                    backgroundImage:
                      "url(https://cdn.builder.io/api/v1/image/assets%2F5b07ec5f702f438fa184683aacc2ca77%2F6471e8fb5c1046dd99dacdbeea2a54f6)",
                    width: "146px",
                    height: "32px",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    overflow: "hidden",
                  }}
                />
              </Link>
              <div />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4">
            <Button
              className="w-full h-12 rounded-xl bg-[#0f172a] text-white shadow-lg transition-colors hover:bg-[#0c1220]"
              onClick={() => {
                openModal();
                setSidebarOpen(false);
              }}
            >
              <Plus className="h-5 w-5 mr-2" /> Create Proposal
            </Button>
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-blue-600" : "text-gray-400",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-border">
            <Link
              to={publicProfilePath}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.businessName || "Business"}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  {user?.plan && (
                    <Badge
                      className={`text-xs ${getPlanBadgeColor(user.plan)}`}
                    >
                      {user.plan.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4 ml-auto">
              <NotificationCenter />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-accent"
                    onClick={() => {
                      if (user) {
                        const bizId = `biz_${user.id}`;
                        window.location.href = `/business/${bizId}`;
                      }
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {user?.businessName}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to={user ? `/business/biz_${user.id}` : "/discovery"}
                      className="flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Public Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings?tab=app" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Plans
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
