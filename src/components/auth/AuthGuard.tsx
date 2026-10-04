"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (publicPaths.includes(pathname)) {
            void Promise.resolve().then(() => setChecking(false));
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        void Promise.resolve().then(() => setChecking(false));
    }, [pathname, router]);

    if (checking) {
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