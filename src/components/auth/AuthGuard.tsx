"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiFetch, clearSession, saveSession } from "@/lib/api";

type AuthGuardProps = {
    children: React.ReactNode;
};

const publicPaths = [
    "/login",
    "/forgot-password",
    "/reset-password",
];

export default function AuthGuard({
    children,
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const expireSession = () => {
            clearSession();
            router.replace("/login");
        };

        window.addEventListener("auth-session-expired", expireSession);

        if (publicPaths.includes(pathname)) {
            return () => {
                active = false;
                window.removeEventListener("auth-session-expired", expireSession);
            };
        }

        void apiFetch("/api/auth/session")
            .then(async (response) => {
                if (!response.ok) throw new Error("Session expired");
                const data = await response.json();
                saveSession(data);
                if (active) setAuthorizedPath(pathname);
            })
            .catch(() => {
                if (active) expireSession();
            });

        return () => {
            active = false;
            window.removeEventListener("auth-session-expired", expireSession);
        };
    }, [pathname, router]);

    if (!publicPaths.includes(pathname) && authorizedPath !== pathname) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    Checking authentication...
                </p>
            </div>
        );
    }

    if (publicPaths.includes(pathname)) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />

            <div className="md:pl-64">
                <Header />

                <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
                    {children}
                </main>
            </div>
        </>
    );
}
