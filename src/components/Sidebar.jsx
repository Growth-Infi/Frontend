import { NavLink, useNavigate } from "react-router-dom";
import logoPic from "../assets/growthinfi_logo.jpeg";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Megaphone,
  ShieldCheck,
  Mail,
  Sparkles,
  Globe,
  Settings,
  LogOut,
  Bookmark,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/campaign", label: "Campaign", icon: Megaphone },
  { to: "/email-verifier", label: "Email Verifier", icon: ShieldCheck },
  { to: "/ice-breaker", label: "Ice Breaker", icon: Mail },
  { to: "/ai-enrichment", label: "AI Enrichment", icon: Sparkles },
  { to: "/find-domains", label: "Find Domains", icon: Globe },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/saved", label: "Saved", icon: Bookmark },
];

const linkClasses = ({ isActive }) =>
  [
    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
    isActive ? "bg-blue-50 text-blue-700" : "text-stone-600 hover:bg-stone-100",
  ].join(" ");

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <img
          src={logoPic}
          alt="GrowthInfi logo"
          className="w-7 h-7 rounded-md object-cover"
        />
        <span className="font-semibold text-[15px] tracking-tight text-stone-900">
          GrowthInfi
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
        <NavLink to="/home" className={linkClasses}>
          <Home size={18} strokeWidth={2} />
          <span>Home</span>
        </NavLink>

        <hr className="my-2 border-stone-200" />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={linkClasses}>
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-stone-200 px-3 py-3">
        {user?.email && (
          <p
            className="px-3 pb-2 text-xs text-blue-800 truncate"
            title={user.email}
          >
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
