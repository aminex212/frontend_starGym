"use client";

import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Trophy,
  Users,
  Clock,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Members",
    href: "/members",
    icon: Users,
  },
  {
    name: "Groups",
    href: "/training-groups",
    icon: Clock,
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

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [adminName, setAdminName] = useState("Admin");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // =========================
  // Load Admin Name
  // =========================

  useEffect(() => {
    function loadAdminName() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setAdminName("Admin");
        return;
      }

      try {
        const admin = JSON.parse(storedUser);
        setAdminName(admin.name || "Admin");
      } catch {
        setAdminName("Admin");
      }
    }

    loadAdminName();

    window.addEventListener("admin-profile-updated", loadAdminName);

    return () => {
      window.removeEventListener("admin-profile-updated", loadAdminName);
    };
  }, []);

  // =========================
  // Get Notifications
  // =========================

  async function loadNotifications() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      setLoadingNotifications(true);

      const response = await fetch(`${API_URL}/api/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();

      setNotifications(data);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }

  // Load notifications when Header mounts
  useEffect(() => {
    loadNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // Mark One Notification Read
  // =========================

  async function markAsRead(id: string) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  }

  // =========================
  // Mark All Notifications Read
  // =========================

  async function markAllAsRead() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Mark all notifications error:", error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  }

  // =========================
  // Unread Count
  // =========================

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =========================
  // Logout
  // =========================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:h-20 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger
          render={
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />

        <SheetContent side="left" className="w-72 overflow-y-auto p-0">
          <SheetHeader className="border-b px-5 py-6 text-left">
            <SheetTitle className="tracking-wider">
              STARGYM
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.name}
                </Link>
              );
            })}

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-[18px] w-[18px] shrink-0" />
              Settings
            </Link>
          </nav>

          <div className="mt-auto space-y-3 border-t p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              Logout
            </button>

            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                {adminName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {adminName}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop title */}
      <div className="hidden md:block">
        <p className="text-xs text-muted-foreground">
          Welcome back
        </p>

        <h2 className="text-lg font-semibold">
          StarGym Dashboard
        </h2>
      </div>

      {/* Mobile logo */}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <span className="font-bold tracking-wider">
          STARGYM
        </span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Messages */}
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-muted"
          aria-label="Messages"
          title="Messages"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowNotifications((prev) => !prev)
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[350px] overflow-hidden rounded-2xl border bg-background shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Notifications
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="max-h-[400px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                    <p className="text-sm font-medium">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      You&apos;re all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (!notification.read) {
                            markAsRead(notification._id);
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`w-full border-b px-4 py-3 text-left transition hover:bg-muted ${!notification.read
                          ? "bg-primary/5"
                          : "bg-background"
                        }`}
                    >
                      <div className="flex gap-3">
                        {/* Unread indicator */}
                        <div className="pt-1.5">
                          <span
                            className={`block h-2 w-2 rounded-full ${notification.read
                                ? "bg-muted-foreground/30"
                                : "bg-red-500"
                              }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-start gap-2">
                              <p
                                className={`text-sm ${notification.read
                                    ? "font-medium"
                                    : "font-semibold"
                                  }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="shrink-0 text-[10px] font-medium text-primary">
                                  NEW
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              aria-label={`Delete ${notification.title}`}
                              title="Delete notification"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="-mr-1 -mt-1 shrink-0 rounded p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[10px] text-muted-foreground">
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {adminName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}