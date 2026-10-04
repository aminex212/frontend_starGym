"use client";

import { Moon, Sun, User, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your StarGym dashboard settings
                </p>
            </div>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <User className="h-5 w-5" />
                        </div>

                        <div>
                            <CardTitle>Admin Profile</CardTitle>
                            <CardDescription>
                                Your administrator information
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Admin name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Leave empty to keep current password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                        />
                    </div>

                    <Button
                        disabled={loading}
                        onClick={async () => {
                            if (password && password !== confirmPassword) {
                                toast.error("Passwords do not match.");
                                return;
                            }

                            setLoading(true);

                            try {
                                const response = await apiFetch("/api/auth/profile", {
                                    method: "PUT",
                                    body: JSON.stringify({
                                        name,
                                        email,
                                        password: password || undefined,
                                    }),
                                });

                                const data = await response.json();

                                if (!response.ok) {
                                    throw new Error(
                                        data.message || "Failed to update profile"
                                    );
                                }

                                if (data.user) {
                                    localStorage.setItem(
                                        "user",
                                        JSON.stringify(data.user)
                                    );
                                    window.dispatchEvent(
                                        new Event("admin-profile-updated")
                                    );
                                }

                                setName("");
                                setEmail("");
                                setPassword("");
                                setConfirmPassword("");

                                toast.success("Profile updated successfully.");
                            } catch (error) {
                                toast.error(
                                    error instanceof Error
                                        ? error.message
                                        : "Something went wrong"
                                );
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {theme === "dark" ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </div>

                        <div>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the dashboard appearance
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">
                                Dark Mode
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Use dark colors throughout the dashboard
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={toggleTheme}
                        >
                            {theme === "dark" ? (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </>
                            ) : (
                                <>
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* General */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <SettingsIcon className="h-5 w-5" />
                        </div>

                        <div>
                            <CardTitle>General</CardTitle>
                            <CardDescription>
                                General StarGym settings
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        More settings will be available here later.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}