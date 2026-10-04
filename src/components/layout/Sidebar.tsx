"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Settings,
  Dumbbell,
  Clock,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Groups",
    href: "/training-groups",
    icon: Clock,
  },
  {
    name: "Members",
    href: "/members",
    icon: Users,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Competitions",
    href: "/competitions",
    icon: Trophy,
  },
  {
    name: "Competition Participants",
    href: "/competition-participants",
    icon: Users,
  },
];

type Admin = {
  name?: string;
  email?: string;
};

function SidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin>({});

  useEffect(() => {
    function loadAdmin() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setAdmin({});
        return;
      }

      try {
        setAdmin(JSON.parse(storedUser));
      } catch {
        setAdmin({});
      }
    }

    loadAdmin();
    window.addEventListener("admin-profile-updated", loadAdmin);

    return () => {
      window.removeEventListener("admin-profile-updated", loadAdmin);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Dumbbell className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-wider">
            STARGYM
          </h1>

          <p className="truncate text-xs text-muted-foreground">
            Fighting Academy
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-3 border-t p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-[18px] w-[18px]" />
          <span>Settings</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>

        {/* Admin */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            {(admin.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {admin.name || "Admin"}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {admin.email || "No email available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background md:block">
      <SidebarContent />
    </aside>
  );
}